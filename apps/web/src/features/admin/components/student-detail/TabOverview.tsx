import { Building02Icon, BookOpen01Icon, Alert01Icon, Tick02Icon } from 'hugeicons-react';

export function TabOverview({ importedData, profileData }: { importedData: any, profileData: any }) {
  const isEligible = importedData.activeBacklogs === 0 && (importedData.cgpa || 0) >= 6.0;

  return (
    <div className="space-y-6">
      {/* Eligibility Alert */}
      <div className={`p-4 rounded-lg flex items-start gap-3 ${isEligible ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
        {isEligible ? (
          <Tick02Icon className="w-5 h-5 text-green-600 mt-0.5" />
        ) : (
          <Alert01Icon className="w-5 h-5 text-red-600 mt-0.5" />
        )}
        <div>
          <h4 className={`font-medium ${isEligible ? 'text-green-800' : 'text-red-800'}`}>
            {isEligible ? 'Eligible for Placements' : 'Not Eligible for Most Placements'}
          </h4>
          <p className={`text-sm mt-1 ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
            {!isEligible && (
              <>
                {importedData.activeBacklogs > 0 && <span>Student has {importedData.activeBacklogs} active backlogs. </span>}
                {(importedData.cgpa || 0) < 6.0 && <span>CGPA is below 6.0 ({importedData.cgpa}).</span>}
              </>
            )}
            {isEligible && 'Student meets standard eligibility criteria (0 backlogs, CGPA >= 6.0).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Snapshot */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen01Icon className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-gray-900">Academic Snapshot</h3>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">{importedData.department}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Batch</dt>
              <dd className="mt-1 text-sm text-gray-900">{importedData.academicYear}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">CGPA</dt>
              <dd className="mt-1 text-sm font-semibold text-indigo-600">{importedData.cgpa || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Backlogs</dt>
              <dd className={`mt-1 text-sm font-semibold ${importedData.activeBacklogs > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {importedData.activeBacklogs || 0}
              </dd>
            </div>
          </dl>
        </div>

        {/* Placement Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building02Icon className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Placement Summary</h3>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{importedData.placementStatus || 'Unplaced'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Applications</dt>
              <dd className="mt-1 text-sm text-gray-900">{profileData?.applications?.length || 0}</dd>
            </div>
            {importedData.placementStatus === 'Placed' && importedData.companyName && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Placed Company</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{importedData.companyName}</dd>
                {importedData.fixedSalaryLpa && (
                  <p className="text-xs text-gray-500 mt-1">Package: {importedData.fixedSalaryLpa} LPA</p>
                )}
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
