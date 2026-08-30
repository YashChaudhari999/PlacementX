import { Badge } from '@/components/ui';
import { Building02Icon, Calendar02Icon, Briefcase02Icon, File01Icon } from 'hugeicons-react';
import { format } from 'date-fns';

export function TabPlacements({ importedData, profileData }: { importedData: any, profileData: any }) {
  const applications = profileData?.applications || [];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Application History</h3>
          <Badge className="bg-indigo-50 text-indigo-700">{applications.length} Applications</Badge>
        </div>
        
        {applications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {applications.map((app: any, idx: number) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2 flex-shrink-0">
                      {app.drive?.company?.logoUrl ? (
                        <img src={app.drive.company.logoUrl} alt={app.drive.company.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building02Icon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{app.drive?.company?.name || 'Unknown Company'}</h4>
                      <p className="text-sm text-gray-600 font-medium">{app.drive?.jobRole || 'Software Engineer'}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar02Icon className="w-3.5 h-3.5" />
                          <span>Applied: {format(new Date(app.appliedAt), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase02Icon className="w-3.5 h-3.5" />
                          <span>Package: {app.drive?.fixedSalary ? `${app.drive.fixedSalary} LPA` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={
                      app.status === 'APPLIED' ? 'bg-blue-50 text-blue-700' :
                      app.status === 'SHORTLISTED' ? 'bg-indigo-50 text-indigo-700' :
                      app.status === 'SELECTED' ? 'bg-green-50 text-green-700' :
                      app.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {app.status}
                    </Badge>
                    
                    {app.offerLetter && (
                      <div className="mt-3">
                        <a 
                          href={app.offerLetter.offerLetterUrl || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 bg-green-50 px-2 py-1 rounded"
                        >
                          <File01Icon className="w-3.5 h-3.5" />
                          View Offer Letter
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building02Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-gray-900 font-medium">No Applications Yet</h4>
            <p className="text-gray-500 text-sm mt-1">This student has not applied to any placement drives.</p>
          </div>
        )}
      </div>
    </div>
  );
}
