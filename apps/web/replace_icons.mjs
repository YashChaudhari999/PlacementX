import fs from 'fs';
import path from 'path';

const map = {
  ShieldCheck: 'Shield01Icon', Clock: 'Clock01Icon', AlertTriangle: 'Alert01Icon', FileText: 'Note01Icon',
  ArrowRight: 'ArrowRight01Icon', RefreshCw: 'RefreshIcon', CheckCircle2: 'TickDouble02Icon', ChevronRight: 'ArrowRight01Icon',
  Loader2: 'Loading02Icon', X: 'Cancel01Icon', AlertCircle: 'Alert02Icon', CheckCircle: 'Tick02Icon', Info: 'InformationCircleIcon',
  Upload: 'Upload01Icon', User: 'UserIcon', Image: 'Image01Icon', Eye: 'ViewIcon', EyeOff: 'ViewOffIcon', Search: 'Search01Icon',
  Target: 'Target01Icon', Download: 'Download01Icon', Maximize2: 'Maximize01Icon', Minimize2: 'Minimize01Icon',
  Building2: 'Building02Icon', IndianRupee: 'Money01Icon', Users: 'UserMultipleIcon', TrendingUp: 'ArrowUp01Icon',
  TrendingDown: 'ArrowDown01Icon', Minus: 'MinusSignIcon', Building: 'Building01Icon', Briefcase: 'Briefcase01Icon',
  Sparkles: 'SparklesIcon', Filter: 'FilterIcon', RefreshCcw: 'RefreshIcon', SlidersHorizontal: 'Settings02Icon',
  Activity: 'Activity01Icon', FileWarning: 'Note01Icon', CalendarDays: 'Calendar01Icon', BookOpen: 'BookOpen01Icon',
  Calendar: 'Calendar01Icon', Layers: 'Layers01Icon', Check: 'Tick01Icon', ChevronDown: 'ArrowDown01Icon',
  AlignLeft: 'AlignLeftIcon', Tag: 'Tag01Icon', FileSpreadsheet: 'Note01Icon', FileDown: 'Note01Icon',
  XCircle: 'CancelCircleIcon', Globe: 'GlobalIcon', Save: 'FloppyDiskIcon', Bell: 'Notification01Icon',
  Database: 'DatabaseIcon', Shield: 'Shield01Icon', Key: 'Key01Icon', GraduationCap: 'Mortarboard01Icon',
  Server: 'ServerStack01Icon', Link: 'Link01Icon', Copy: 'Copy01Icon', Edit: 'Edit01Icon', Trash2: 'Delete01Icon',
  Smartphone: 'SmartPhone01Icon', LayoutTemplate: 'Layout01Icon', Plus: 'PlusSignIcon', Edit2: 'Edit02Icon',
  Star: 'StarIcon', Mail: 'Mail01Icon', Megaphone: 'Megaphone01Icon', History: 'Time01Icon', Send: 'SentIcon',
  Inbox: 'InboxIcon', BarChart3: 'BarChartIcon', Bookmark: 'Bookmark01Icon', ArrowLeft: 'ArrowLeft01Icon',
  Rocket: 'RocketIcon', Award: 'Award01Icon', ExternalLink: 'Link02Icon', Zap: 'EnergyIcon', Menu: 'Menu01Icon',
  LayoutDashboard: 'DashboardSquare01Icon', UserCircle: 'UserCircleIcon', Quote: 'QuoteDownIcon', Phone: 'CallIcon',
  MapPin: 'Location01Icon', Sun: 'Sun01Icon', Moon: 'Moon01Icon', Video: 'Video01Icon', FileCheck: 'Note01Icon',
  Lightbulb: 'Idea01Icon', ArrowUpRight: 'ArrowUpRight01Icon', ShieldAlert: 'Alert01Icon',
  ChevronLeft: 'ArrowLeft01Icon', CalendarClock: 'Calendar01Icon', Settings: 'Settings01Icon',
  Trophy: 'Award01Icon', UploadCloud: 'CloudUploadIcon', UserPlus: 'UserAdd01Icon', ArrowUp: 'ArrowUp01Icon',
  ArrowDown: 'ArrowDown01Icon', RotateCcw: 'RotateLeft01Icon', ClipboardCheck: 'ClipboardIcon', Paperclip: 'Attachment01Icon',
  MessageSquare: 'Message01Icon', UserCircle2: 'UserCircle02Icon', Clock4: 'Clock04Icon', CheckSquare: 'Tick01Icon',
  Flag: 'Flag01Icon', Hash: 'HashtagIcon', Languages: 'LanguageSkillIcon', FileBadge: 'FileAddIcon',
  Wrench: 'Wrench01Icon', Monitor: 'ComputerIcon', Terminal: 'CodeIcon', AppWindow: 'DashboardSquare01Icon',
  Globe2: 'Globe02Icon', Camera: 'Camera01Icon', LineChart: 'ChartLineData01Icon', LogOut: 'Logout01Icon',
  ChevronsLeft: 'ArrowLeftDoubleIcon', ChevronsRight: 'ArrowRightDoubleIcon', ClipboardList: 'Task01Icon',
  Medal: 'Award01Icon', UserCheck: 'UserTick01Icon'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let totalReplaced = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // Also remove LucideIcon type usages
  const lucideRegex = /import\s+(?:type\s+)?\{\s*(?:[^}]*,\s*)?LucideIcon(?:\s*,\s*[^}]*)?\s*\}\s+from\s+['`]lucide-react['`];?/g;
  if (lucideRegex.test(content)) {
     content = content.replace(lucideRegex, "import type { ElementType } from 'react';");
     content = content.replace(/\bLucideIcon\b/g, 'ElementType');
     hasChanges = true;
  }
  
  // Specifically fix DriveList.tsx
  if (file.includes('DriveList.tsx') && content.includes('drive.registrationStart')) {
    content = content.replace(/drive\.registrationStart/g, '(drive as any).registrationStart');
    content = content.replace(/drive\.registrationEnd/g, '(drive as any).registrationEnd');
    hasChanges = true;
  }

  // Also replace any lingering wrong hugeicons imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['`]hugeicons-react['`];?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importStr = match[0];
    const iconNames = match[1].split(',').map(i => i.trim()).filter(i => i);
    
    const newIcons = [];
    const varReplacements = [];
    let changed = false;
    
    iconNames.forEach(iconName => {
      let orig = iconName;
      let alias = orig;
      if (orig.includes(' as ')) {
        const parts = orig.split(' as ');
        orig = parts[0].trim();
        alias = parts[1].trim();
      }
      
      // If it ends in Icon and was a fallback that failed, let's look up its base name
      const baseName = orig.replace(/Icon$/, '');
      if (map[baseName] && map[baseName] !== orig) {
         changed = true;
         newIcons.push(map[baseName]);
         varReplacements.push({ from: alias, to: map[baseName] });
      } else {
         newIcons.push(orig);
      }
    });
    
    if (changed) {
      const newImportStr = `import { ${[...new Set(newIcons)].join(', ')} } from 'hugeicons-react';`;
      content = content.replace(importStr, newImportStr);
      
      varReplacements.forEach(({from, to}) => {
        if (from === to) return;
        const regex = new RegExp(`\\b${from}\\b`, 'g');
        content = content.replace(regex, to);
      });
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    totalReplaced++;
  }
}
console.log(`Fixed in ${totalReplaced} files.`);
