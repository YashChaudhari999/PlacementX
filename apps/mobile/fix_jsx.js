const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix missing curly braces around JSX expressions like color=theme.colors.card
      // Specifically looking for attr=theme... or attr=(theme...)
      let changed = false;
      const jsxRegex = /([a-zA-Z]+)=(theme\.colors\.[a-zA-Z0-9]+(?:\s*\+\s*['"][0-9]+['"])?)/g;
      const jsxRegexWithParen = /([a-zA-Z]+)=\((theme\.colors\.[a-zA-Z0-9]+(?:\s*\+\s*['"][0-9]+['"])?)\)/g;

      if (jsxRegex.test(content) || jsxRegexWithParen.test(content)) {
        content = content.replace(jsxRegex, '$1={$2}');
        content = content.replace(jsxRegexWithParen, '$1={$2}');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed JSX braces in ${fullPath}`);
      }
    }
  }
}

processDir('./src/screens');
