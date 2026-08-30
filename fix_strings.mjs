import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) callback(p);
  });
}

walk('./apps/web/src', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix placeholders
  content = content.replace(/placeholder=["']Search01Icon\b([^"']*)["']/g, 'placeholder="Search$1"');

  // Fix known labels
  content = content.replace(/label:\s*['"]InboxIcon['"]/g, "label: 'Inbox'");
  content = content.replace(/label:\s*['"]SentIcon Notification['"]/g, "label: 'Send Notification'");
  content = content.replace(/label:\s*['"]Export Time01Icon['"]/g, "label: 'Export History'");
  content = content.replace(/label:\s*['"]Sent Time01Icon['"]/g, "label: 'Sent History'");
  
  content = content.replace(/>\s*SentIcon Notification\s*</g, '>Send Notification<');
  content = content.replace(/>\s*SentIcon Immediately\s*</g, '>Send Immediately<');
  content = content.replace(/>\s*SentIcon us a Message\s*</g, '>Send us a Message<');
  content = content.replace(/>\s*Primary DatabaseIcon\s*</g, '>Primary Database<');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
