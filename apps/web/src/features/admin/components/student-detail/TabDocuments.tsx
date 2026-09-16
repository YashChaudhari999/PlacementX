import { File01Icon, Download01Icon, Tick02Icon, Cancel01Icon, Alert01Icon } from 'hugeicons-react';
import { Button, Badge } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function TabDocuments({
 importedData,
 profileData,
}: {
 importedData: any;
 profileData: any;
}) {
 const { data: academicData } = useQuery({
 queryKey: ['adminAcademicDocument', profileData?.id],
 queryFn: async () => {
 const res = await api.get(`/admin/students/${profileData?.id}/documents/academic`);
 return res.data;
 },
 enabled: !!profileData?.id,
 });

 const academicDocuments = academicData?.academicDocuments || [];

 const getDocUrl = (type: string) =>
 academicDocuments.find((d: any) => d.documentType === type)?.signedUrl;
 const getDocDate = (type: string) =>
 academicDocuments.find((d: any) => d.documentType === type)?.uploadedAt;

 const documents = [
 {
 id: 'resume',
 name: 'Primary Resume',
 type: 'PDF',
 url: profileData?.resumeUrl,
 status: profileData?.resumeUrl ? 'Verified' : 'Missing',
 date: profileData?.updatedAt,
 },
 {
 id: 'marksheet-10',
 name: '10th Marksheet',
 type: 'PDF',
 url: getDocUrl('10TH_MARKSHEET'),
 status: getDocUrl('10TH_MARKSHEET') ? 'Uploaded' : 'Missing',
 date: getDocDate('10TH_MARKSHEET'),
 },
 {
 id: 'marksheet-12',
 name: '12th / Diploma Marksheet',
 type: 'PDF',
 url: getDocUrl('12TH_DIPLOMA_MARKSHEET'),
 status: getDocUrl('12TH_DIPLOMA_MARKSHEET') ? 'Uploaded' : 'Missing',
 date: getDocDate('12TH_DIPLOMA_MARKSHEET'),
 },
 {
 id: 'degree-marksheets',
 name: 'Degree Semester-wise Marksheets',
 type: 'PDF',
 url: getDocUrl('DEGREE_MARKSHEETS'),
 status: getDocUrl('DEGREE_MARKSHEETS') ? 'Uploaded' : 'Missing',
 date: getDocDate('DEGREE_MARKSHEETS'),
 },
 ];

 return (
 <div className="space-y-6">
 <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
 <div className="px-6 py-4 border-b border-border bg-muted/50">
 <h3 className="font-semibold text-foreground">Student Documents</h3>
 <p className="text-sm text-muted-foreground mt-1">Review and verify uploaded documents.</p>
 </div>

 <div className="divide-y divide-gray-100">
 {documents.map((doc) => (
 <div
 key={doc.id}
 className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
 >
 <div className="flex items-center gap-4">
 <div
 className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.url ? 'bg-indigo-50 text-indigo-600' : 'bg-muted text-muted-foreground border border-border border-dashed'}`}
 >
 <File01Icon className="w-6 h-6"/>
 </div>
 <div>
 <h4 className="font-medium text-foreground">{doc.name}</h4>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-xs text-muted-foreground">{doc.type}</span>
 {doc.url ? (
 <Badge className="bg-success-muted text-green-700">Uploaded</Badge>
 ) : (
 <Badge className="bg-warning-muted text-amber-700">Missing</Badge>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
 {doc.url ? (
 <>
 <Button
 variant="outline"
 size="sm"
 className="w-full md:w-auto"
 onClick={() => window.open(doc.url, '_blank')}
 >
 <File01Icon className="w-4 h-4 mr-1.5"/>
 View
 </Button>
 <Button
 variant="outline"
 size="sm"
 className="text-success hover:text-green-700 hover:bg-success-muted border-green-200"
 title="Verify"
 >
 <Tick02Icon className="w-4 h-4"/>
 </Button>
 <Button
 variant="outline"
 size="sm"
 className="text-destructive hover:text-red-700 hover:bg-destructive-muted border-red-200"
 title="Reject"
 >
 <Cancel01Icon className="w-4 h-4"/>
 </Button>
 </>
 ) : (
 <Button variant="outline"size="sm"disabled className="w-full md:w-auto">
 <Alert01Icon className="w-4 h-4 mr-1.5"/>
 Request Upload
 </Button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
