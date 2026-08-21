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

  // 3. Filter top-level main categories for display in the Mega Menu
  const result: HierarchyCategory[] = [];

  categoryMap.forEach((cat) => {
    // Determine if it is a top-level parent category
    const isTopLevel = !cat.parentId || !categoryMap.has(cat.parentId);

    // Filter out "Uncategorized" unless it genuinely has subcategories
    const isUncategorized = cat.name.trim().toLowerCase() === 'uncategorized';

    // Must have at least 1 valid child/subcategory
    const hasSubcategories = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;

    // Rule: Only render parent category if it has at least one valid subcategory
    if (isTopLevel && hasSubcategories && !isUncategorized) {
      result.push(cat);
    }
  });

  // Fallback: If no category has explicit subcategories, return top-level valid categories
  if (result.length === 0) {
    categoryMap.forEach((cat) => {
      const isTopLevel = !cat.parentId || !categoryMap.has(cat.parentId);
      const isUncategorized = cat.name.trim().toLowerCase() === 'uncategorized';
      if (isTopLevel && !isUncategorized) {
        result.push(cat);
      }
    });
  }

  return result;
}
