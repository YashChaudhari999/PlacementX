import { File01Icon, Download01Icon, Tick02Icon, Cancel01Icon, Alert01Icon } from 'hugeicons-react';
import { Button, Badge } from '@/components/ui';

export function TabDocuments({
  importedData,
  profileData,
}: {
  importedData: any;
  profileData: any;
}) {
  // Since we don't have a complex document model yet, we'll just show the resume and a placeholder for others
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
      type: 'PDF/IMG',
      url: null,
      status: 'Missing',
      date: null,
    },
    {
      id: 'marksheet-12',
      name: '12th Marksheet',
      type: 'PDF/IMG',
      url: null,
      status: 'Missing',
      date: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Student Documents</h3>
          <p className="text-sm text-gray-500 mt-1">Review and verify uploaded documents.</p>
        </div>

        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.url ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 border border-gray-200 border-dashed'}`}
                >
                  <File01Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{doc.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{doc.type}</span>
                    {doc.url ? (
                      <Badge className="bg-green-50 text-green-700">Uploaded</Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700">Missing</Badge>
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
                      <File01Icon className="w-4 h-4 mr-1.5" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                      title="Verify"
                    >
                      <Tick02Icon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      title="Reject"
                    >
                      <Cancel01Icon className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" disabled className="w-full md:w-auto">
                    <Alert01Icon className="w-4 h-4 mr-1.5" />
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
