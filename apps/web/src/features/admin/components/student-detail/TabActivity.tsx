import { Clock01Icon, UserIcon } from 'hugeicons-react';
import { format } from 'date-fns';

export function TabActivity({
 importedData,
 profileData,
}: {
 importedData: any;
 profileData: any;
}) {
 const auditLogs = profileData?.auditLogs || [];

 return (
 <div className="space-y-6">
 <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
 <div className="px-6 py-4 border-b border-border bg-muted/50">
 <h3 className="font-semibold text-foreground">Activity & Audit Trail</h3>
 </div>

 {auditLogs.length > 0 ? (
 <div className="p-6">
 <div className="relative border-l border-border ml-3 space-y-6">
 {auditLogs.map((log: any, idx: number) => (
 <div key={idx} className="relative pl-6">
 <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gray-200 rounded-full border-2 border-white"></div>
 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
 <div>
 <p className="text-sm font-medium text-foreground">{log.action}</p>
 <p className="text-sm text-muted-foreground mt-0.5">
 {log.comments || 'No additional comments.'}
 </p>
 <div className="flex items-center gap-2 mt-2">
 <span className="inline-flex items-center text-xs text-muted-foreground">
 <UserIcon className="w-3 h-3 mr-1"/>
 {log.performedBy}
 </span>
 </div>
 </div>
 <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
 <Clock01Icon className="w-3.5 h-3.5 mr-1"/>
 {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="p-12 text-center">
 <Clock01Icon className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
 <h4 className="text-foreground font-medium">No Activity Logged</h4>
 <p className="text-muted-foreground text-sm mt-1">
 There are no audit logs for this student's profile yet.
 </p>
 </div>
 )}
 </div>
 </div>
 );
}
