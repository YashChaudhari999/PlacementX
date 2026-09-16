export function TabAcademic({
 importedData,
 profileData,
}: {
 importedData: any;
 profileData: any;
}) {
 const currentSemester = profileData?.currentSemester || 8; // default to 8 if unknown

 return (
 <div className="space-y-6">
 <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
 <div className="px-6 py-4 border-b border-border bg-muted/50">
 <h3 className="font-semibold text-foreground">Education History</h3>
 </div>
 <div className="p-0">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-muted text-xs text-muted-foreground uppercase font-semibold">
 <tr>
 <th className="px-6 py-3 text-left">Level</th>
 <th className="px-6 py-3 text-left">Board/University</th>
 <th className="px-6 py-3 text-left">Year</th>
 <th className="px-6 py-3 text-left">Score</th>
 </tr>
 </thead>
 <tbody className="bg-card divide-y divide-gray-200">
 {/* 10th */}
 <tr>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
 10th (SSC)
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData?.tenthBoard || '—'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData?.tenthYear || '—'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {profileData?.tenthPercentage ? `${profileData.tenthPercentage}%` : '—'}
 </td>
 </tr>
 {/* 12th */}
 <tr>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
 12th (HSC)
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData?.twelfthBoard || '—'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData?.twelfthYear || '—'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {profileData?.twelfthPercentage ? `${profileData.twelfthPercentage}%` : '—'}
 </td>
 </tr>
 {/* Diploma (if any) */}
 {profileData?.diplomaBoard && (
 <tr>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
 Diploma
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData.diplomaBoard}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData.diplomaYear}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {profileData.diplomaPercentage}%
 </td>
 </tr>
 )}
 {/* Degree */}
 <tr>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
 Degree (B.Tech/BE)
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {importedData.department}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {profileData?.passingYear || '—'}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
 {importedData.cgpa ? `${importedData.cgpa} CGPA` : '—'}
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
 <div className="px-6 py-4 border-b border-border bg-muted/50">
 <h3 className="font-semibold text-foreground">Current Engineering Semesters</h3>
 </div>
 <div className="p-0">
 <div className="px-6 py-4 border-b border-border text-sm text-muted-foreground bg-card">
 <p>
 Current Semester:{' '}
 <span className="font-semibold text-foreground">{currentSemester}</span> | Total
 Backlogs (History):{' '}
 <span className="font-semibold text-foreground">{profileData?.totalBacklogs || 0}</span>{' '}
 | Active Backlogs:{' '}
 <span
 className={`font-semibold ${importedData.activeBacklogs > 0 ? 'text-destructive' : 'text-success'}`}
 >
 {importedData.activeBacklogs || 0}
 </span>
 </p>
 </div>

 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-muted text-xs text-muted-foreground uppercase font-semibold">
 <tr>
 <th className="px-6 py-3 text-left">Semester</th>
 <th className="px-6 py-3 text-left">CGPA</th>
 <th className="px-6 py-3 text-left">Ongoing Backlogs</th>
 <th className="px-6 py-3 text-left">Total Backlogs</th>
 <th className="px-6 py-3 text-center">Marksheet</th>
 </tr>
 </thead>
 <tbody className="bg-card divide-y divide-gray-200">
 {profileData?.semesterMarks?.length > 0 ? (
 profileData.semesterMarks.map((mark: any, idx: number) => (
 <tr key={idx} className="hover:bg-muted/50">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
 Sem {mark.semester}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
 {mark.cgpa}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {mark.ongoingBacklogs}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
 {mark.totalBacklogs}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-center">
 {mark.marksheetUrl ? (
 <a
 href={mark.marksheetUrl}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
 >
 View
 </a>
 ) : (
 <span className="text-xs text-muted-foreground italic">Not Uploaded</span>
 )}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground italic">
 No semester marks added yet.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
