const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /['"]#F8FAFC['"]/gi, replacement: 'theme.colors.background' },
  { regex: /['"]#FFFFFF['"]/gi, replacement: 'theme.colors.card' },
  { regex: /['"]#0f172a['"]/gi, replacement: 'theme.colors.foreground' },
  { regex: /['"]#FEE2E2['"]/gi, replacement: '(theme.colors.destructive + "15")' },
  { regex: /['"]#DC2626['"]/gi, replacement: 'theme.colors.destructive' },
  { regex: /['"]#D1FAE5['"]/gi, replacement: '(theme.colors.success + "15")' },
  { regex: /['"]#059669['"]/gi, replacement: 'theme.colors.success' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // Don't modify theme.ts itself
      if (fullPath.includes('theme.ts')) continue;
      
      for (const r of replacements) {
        if (r.regex.test(content)) {
          content = content.replace(r.regex, r.replacement);
          changed = true;
        }
      }
      
      if (changed) {
        // check if theme is imported
        if (!content.includes('import { theme }') && !content.includes('import {theme}')) {
          // find relative path
          const depth = fullPath.split(path.sep).length - dir.split(path.sep).length + 1;
          const prefix = '../'.repeat(depth);
          content = `import { theme } from '${prefix}theme/theme';\n` + content;
        }
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./src/screens');
