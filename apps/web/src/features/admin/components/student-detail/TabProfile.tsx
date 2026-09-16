import {
 Link02Icon,
 Mail01Icon,
 CallIcon,
 MapsLocation01Icon,
 CodeIcon,
 Briefcase01Icon,
} from 'hugeicons-react';
import { Badge } from '@/components/ui';

export function TabProfile({ importedData, profileData }: { importedData: any; profileData: any }) {
 let skills: string[] = [];
 if (Array.isArray(profileData?.skills)) {
 skills = profileData.skills;
 } else if (typeof profileData?.skills === 'string') {
 skills = profileData.skills
 .split(',')
 .map((s: string) => s.trim())
 .filter(Boolean);
 } else if (typeof importedData?.skills === 'string') {
 skills = importedData.skills
 .split(',')
 .map((s: string) => s.trim())
 .filter(Boolean);
 }

 let programmingLanguages: string[] = [];
 if (Array.isArray(profileData?.programmingLanguages)) {
 programmingLanguages = profileData.programmingLanguages;
 } else if (typeof profileData?.programmingLanguages === 'string') {
 programmingLanguages = profileData.programmingLanguages
 .split(',')
 .map((s: string) => s.trim())
 .filter(Boolean);
 }

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-1 space-y-6">
 {/* Contact Info */}
 <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
 <h3 className="font-semibold text-foreground mb-4 border-b border-border pb-2">
 Contact Details
 </h3>
 <ul className="space-y-3">
 <li className="flex items-start gap-3">
 <Mail01Icon className="w-5 h-5 text-muted-foreground mt-0.5"/>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
 <p className="text-sm text-foreground">{importedData.email}</p>
 </div>
 </li>
 <li className="flex items-start gap-3">
 <CallIcon className="w-5 h-5 text-muted-foreground mt-0.5"/>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
 <p className="text-sm text-foreground">{profileData?.phone || '—'}</p>
 </div>
 </li>
 <li className="flex items-start gap-3">
 <MapsLocation01Icon className="w-5 h-5 text-muted-foreground mt-0.5"/>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Address</p>
 <p className="text-sm text-foreground">{profileData?.address || '—'}</p>
 </div>
 </li>
 </ul>
 </div>

 {/* Links */}
 <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
 <h3 className="font-semibold text-foreground mb-4 border-b border-border pb-2">
 Web Presence
 </h3>
 <ul className="space-y-3">
 <li className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-info-muted flex items-center justify-center flex-shrink-0">
 <span className="text-info font-bold text-xs">in</span>
 </div>
 <div className="flex-1 truncate">
 {profileData?.linkedinUrl ? (
 <a
 href={profileData.linkedinUrl}
 target="_blank"
 rel="noreferrer"
 className="text-sm text-info hover:underline truncate block"
 >
 LinkedIn Profile
 </a>
 ) : (
 <span className="text-sm text-muted-foreground">Not provided</span>
 )}
 </div>
 </li>
 <li className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
 <CodeIcon className="w-4 h-4 text-foreground"/>
 </div>
 <div className="flex-1 truncate">
 {profileData?.githubUrl ? (
 <a
 href={profileData.githubUrl}
 target="_blank"
 rel="noreferrer"
 className="text-sm text-foreground hover:underline truncate block"
 >
 GitHub Profile
 </a>
 ) : (
 <span className="text-sm text-muted-foreground">Not provided</span>
 )}
 </div>
 </li>
 <li className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
 <Link02Icon className="w-4 h-4 text-indigo-600"/>
 </div>
 <div className="flex-1 truncate">
 {profileData?.portfolioUrl ? (
 <a
 href={profileData.portfolioUrl}
 target="_blank"
 rel="noreferrer"
 className="text-sm text-indigo-600 hover:underline truncate block"
 >
 Portfolio / Website
 </a>
 ) : (
 <span className="text-sm text-muted-foreground">Not provided</span>
 )}
 </div>
 </li>
 </ul>
 </div>
 </div>

 <div className="lg:col-span-2 space-y-6">
 {/* Skills */}
 <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
 <h3 className="font-semibold text-foreground mb-4">Skills & Technologies</h3>

 <div className="mb-4">
 <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Core Skills</h4>
 {skills.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {skills.map((skill: string, index: number) => (
 <Badge key={index} className="bg-muted text-foreground border-border">
 {skill}
 </Badge>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No skills added yet.</p>
 )}
 </div>

 <div>
 <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
 Programming Languages
 </h4>
 {programmingLanguages.length > 0 ? (
 <div className="flex flex-wrap gap-2">
 {programmingLanguages.map((lang: string, index: number) => (
 <Badge key={index} className="bg-indigo-50 text-indigo-700 border-indigo-100">
 {lang}
 </Badge>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No languages added yet.</p>
 )}
 </div>
 </div>

 {/* Projects / Experience */}
 <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
 <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
 <Briefcase01Icon className="w-5 h-5 text-muted-foreground"/>
 <h3 className="font-semibold text-foreground">Projects & Experience</h3>
 </div>

 {profileData?.projects && profileData.projects.length > 0 ? (
 <div className="space-y-4">
 {profileData.projects.map((proj: any, idx: number) => (
 <div key={idx} className="border border-border rounded-lg p-4">
 <div className="flex justify-between items-start">
 <h4 className="font-semibold text-foreground">{proj.name}</h4>
 {proj.url && (
 <a
 href={proj.url}
 target="_blank"
 rel="noreferrer"
 className="text-indigo-600 hover:text-indigo-800"
 >
 <Link02Icon className="w-4 h-4"/>
 </a>
 )}
 </div>
 <p className="text-xs text-muted-foreground mt-1">{proj.technologies?.join(', ')}</p>
 <p className="text-sm text-foreground mt-2">{proj.description}</p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground py-4 text-center">No projects available.</p>
 )}
 </div>
 </div>
 </div>
 );
}
