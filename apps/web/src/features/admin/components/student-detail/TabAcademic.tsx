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
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Education History</h3>
        </div>
        <div className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Level</th>
                <th className="px-6 py-3 text-left">Board/University</th>
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* 10th */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  10th (SSC)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profileData?.tenthBoard || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profileData?.tenthYear || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {profileData?.tenthPercentage ? `${profileData.tenthPercentage}%` : '—'}
                </td>
              </tr>
              {/* 12th */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  12th (HSC)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profileData?.twelfthBoard || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profileData?.twelfthYear || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {profileData?.twelfthPercentage ? `${profileData.twelfthPercentage}%` : '—'}
                </td>
              </tr>
              {/* Diploma (if any) */}
              {profileData?.diplomaBoard && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Diploma
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profileData.diplomaBoard}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {profileData.diplomaYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {profileData.diplomaPercentage}%
                  </td>
                </tr>
              )}
              {/* Degree */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Degree (B.Tech/BE)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {importedData.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profileData?.passingYear || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {importedData.cgpa ? `${importedData.cgpa} CGPA` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900">Current Engineering Semesters</h3>
        </div>
        <div className="p-0">
          <div className="px-6 py-4 border-b border-gray-100 text-sm text-gray-500 bg-white">
            <p>
              Current Semester:{' '}
              <span className="font-semibold text-gray-900">{currentSemester}</span> | Total
              Backlogs (History):{' '}
              <span className="font-semibold text-gray-900">{profileData?.totalBacklogs || 0}</span>{' '}
              | Active Backlogs:{' '}
              <span
                className={`font-semibold ${importedData.activeBacklogs > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {importedData.activeBacklogs || 0}
              </span>
            </p>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Semester</th>
                <th className="px-6 py-3 text-left">CGPA</th>
                <th className="px-6 py-3 text-left">Ongoing Backlogs</th>
                <th className="px-6 py-3 text-left">Total Backlogs</th>
                <th className="px-6 py-3 text-center">Marksheet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {profileData?.semesterMarks?.length > 0 ? (
                profileData.semesterMarks.map((mark: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Sem {mark.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mark.cgpa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mark.ongoingBacklogs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                        <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400 italic">
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
