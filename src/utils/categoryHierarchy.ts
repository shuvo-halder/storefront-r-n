import { Category } from '../types/storefront';

export interface HierarchyCategory extends Category {
  subcategories: { id: string; name: string; slug: string }[];
}

/**
 * Transforms raw category items from the API/storefront into a clean,
 * hierarchical structure (Main Category -> Subcategories) and filters out
 * categories that have no subcategories or are unneeded empty columns.
 */
export function buildCategoryHierarchy(categories: Category[]): HierarchyCategory[] {
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }

  // 1. Create a map of categories for quick lookup and deep subcategory manipulation
  const categoryMap = new Map<string, HierarchyCategory>();

  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      ...cat,
      subcategories: Array.isArray(cat.subcategories)
        ? [...cat.subcategories.map((sub) => ({ ...sub }))]
        : []
    });
  });

  // 2. If flat categories exist with parentId, link child categories to parent category's subcategories
  categories.forEach((cat) => {
    if (cat.parentId && categoryMap.has(cat.parentId)) {
      const parent = categoryMap.get(cat.parentId)!;
      const alreadyExists = parent.subcategories.some(
        (sub) => sub.id === cat.id || sub.slug === cat.slug
      );

      if (!alreadyExists) {
        parent.subcategories.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug
        });
      }
    }
  });

  // 3. Extract top-level main categories
  const topLevelList: HierarchyCategory[] = [];

  categoryMap.forEach((cat) => {
    const isTopLevel = !cat.parentId || !categoryMap.has(cat.parentId);
    const isUncategorized = cat.name.trim().toLowerCase() === 'uncategorized';
    const hasSubcategories = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
    const hasItems = (cat.itemCount || 0) > 0;

    // Filter out "Uncategorized" unless it genuinely has subcategories or items
    if (isTopLevel && (!isUncategorized || hasSubcategories || hasItems)) {
      topLevelList.push(cat);
    }
  });

  // 4. Deduplicate top-level main categories with identical normalized names
  const deduplicatedMap = new Map<string, HierarchyCategory>();

  topLevelList.forEach((cat) => {
    const key = cat.name.trim().toLowerCase();
    if (!deduplicatedMap.has(key)) {
      deduplicatedMap.set(key, cat);
    } else {
      const existing = deduplicatedMap.get(key)!;
      const existingSubCount = existing.subcategories.length;
      const currentSubCount = cat.subcategories.length;

      // Merge subcategories from duplicate into primary entry
      cat.subcategories.forEach((sub) => {
        if (!existing.subcategories.some((s) => s.slug === sub.slug || s.id === sub.id)) {
          existing.subcategories.push(sub);
        }
      });

      // Prefer entry that has subcategories or higher itemCount or cleaner slug
      if (
        (currentSubCount > existingSubCount) ||
        (currentSubCount === existingSubCount && (cat.itemCount || 0) > (existing.itemCount || 0)) ||
        (currentSubCount === existingSubCount && cat.slug === key && existing.slug !== key)
      ) {
        deduplicatedMap.set(key, {
          ...cat,
          subcategories: existing.subcategories
        });
      }
    }
  });

  return Array.from(deduplicatedMap.values());
}
