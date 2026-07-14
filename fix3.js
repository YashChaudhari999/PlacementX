const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'apps/web');
const apiDir = path.join(__dirname, 'apps/api');

function replaceInFile(baseDir, filePath, regex, replacement) {
    const fullPath = path.join(baseDir, filePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(regex, replacement);
        fs.writeFileSync(fullPath, content);
    }
}

// AnalyticsDashboard
replaceInFile(webDir, 'src/features/admin/pages/AnalyticsDashboard.tsx', /\{\s*,\s*Users/, '{ Users');

// API - Controllers
replaceInFile(apiDir, 'src/controllers/admin.controller.ts', /applications\.map\(app =>/g, 'applications.map((app: any) =>');
replaceInFile(apiDir, 'src/controllers/admin.controller.ts', /students\.map\(student =>/g, 'students.map((student: any) =>');
replaceInFile(apiDir, 'src/controllers/admin.controller.ts', /rounds\.map\(r =>/g, 'rounds.map((r: any) =>');
replaceInFile(apiDir, 'src/controllers/admin.controller.ts', /deadlines\.map\(d =>/g, 'deadlines.map((d: any) =>');

replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /map\(d =>/g, 'map((d: any) =>');
replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /reduce\(\(sum, s\) =>/g, 'reduce((sum: number, s: any) =>');
replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /filter\(app =>/g, 'filter((app: any) =>');
replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /filter\(d =>/g, 'filter((d: any) =>');
replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /students\.map\(s =>/g, 'students.map((s: any) =>');
replaceInFile(apiDir, 'src/controllers/analytics.controller.ts', /map\(s =>/g, 'map((s: any) =>');

replaceInFile(apiDir, 'src/controllers/student.controller.ts', /map\(app =>/g, 'map((app: any) =>');

// API - Services
replaceInFile(apiDir, 'src/services/eligibility.service.ts', /import\s*\{\s*StudentProfile,\s*PlacementDrive\s*\}\s*from\s*['"]@prisma\/client['"];?/, '');

// notification.service
replaceInFile(apiDir, 'src/services/notification.service.ts', /map\(t =>/g, 'map((t: any) =>');
replaceInFile(apiDir, 'src/services/notification.service.ts', /const failedTokens = \[\]/g, 'const failedTokens: any[] = []');
replaceInFile(apiDir, 'src/services/notification.service.ts', /map\(student =>/g, 'map((student: any) =>');
replaceInFile(apiDir, 'src/services/notification.service.ts', /map\(dt =>/g, 'map((dt: any) =>');
replaceInFile(apiDir, 'src/services/notification.service.ts', /filter\(student =>/g, 'filter((student: any) =>');

console.log("Fix3 applied");
