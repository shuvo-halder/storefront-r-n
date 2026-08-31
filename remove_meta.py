import re

with open('src/utils/analytics.ts', 'r') as f:
    content = f.read()

# Remove single line trackMetaEvent('Search'...)
content = re.sub(r'[ \t]*trackMetaEvent\([^;]*;\n', '', content)
# It might be multiline so let's match carefully
# trackMetaEvent( ... );
content = re.sub(r'[ \t]*// Meta [A-Za-z]+ mapping\n[ \t]*trackMetaEvent\([^;]+;\n', '', content)

with open('src/utils/analytics.ts', 'w') as f:
    f.write(content)
