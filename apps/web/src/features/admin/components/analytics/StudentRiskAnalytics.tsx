import { Card } from '@/components/ui';
import { ShieldAlert, Users, TrendingUp, AlertTriangle, FileText, Briefcase, GraduationCap } from 'lucide-react';
import type { StudentRiskResponse } from '@/types/analytics.types';
import { useState } from 'react';

export default function StudentRiskAnalytics({ data }: { data: StudentRiskResponse }) {
  const [showAll, setShowAll] = useState(false);

  if (!data?.summary) return null;

  const { summary, students, profileReadiness } = data;
  const displayStudents = showAll ? students : students.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-emerald-200 bg-emerald-50/50">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">High Readiness</div>
          <div className="text-2xl font-black text-emerald-900">{summary.highReadiness}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Ready for interviews</div>
        </Card>
        
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Moderate</div>
          <div className="text-2xl font-black text-blue-900">{summary.moderateReadiness}</div>
          <div className="text-xs text-blue-700 font-medium mt-1">Minor skill gaps</div>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Needs Improvement</div>
          <div className="text-2xl font-black text-amber-900">{summary.needsImprovement}</div>
          <div className="text-xs text-amber-700 font-medium mt-1">Targeted training needed</div>
        </Card>

        <Card className="p-4 border-rose-200 bg-rose-50/50 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <AlertTriangle className="w-24 h-24 text-rose-600" />
          </div>
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1 relative z-10">High Intervention</div>
          <div className="text-2xl font-black text-rose-900 relative z-10">{summary.highIntervention}</div>
          <div className="text-xs text-rose-700 font-medium mt-1 relative z-10">Immediate action required</div>
        </Card>
      </div>

      {/* Profile Readiness Insights */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Profile Readiness</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-slate-300" />
            <div>
              <div className="text-lg font-bold text-slate-900">{profileReadiness.missingResume}</div>
              <div className="text-xs text-slate-500">Missing Resume</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-slate-300" />
            <div>
              <div className="text-lg font-bold text-slate-900">{profileReadiness.missingSkills}</div>
              <div className="text-xs text-slate-500">No Skills Listed</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-amber-300" />
            <div>
              <div className="text-lg font-bold text-slate-900">{profileReadiness.pending}</div>
              <div className="text-xs text-slate-500">Pending Verification</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-emerald-300" />
            <div>
              <div className="text-lg font-bold text-slate-900">{profileReadiness.complete}</div>
              <div className="text-xs text-slate-500">Profiles Complete</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Student List */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Priority Intervention List</h3>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            Sorted by Risk (Highest First)
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Score / CGPA</th>
                <th className="px-6 py-3">Funnel Stats</th>
                <th className="px-6 py-3">Intervention Area</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="flex gap-2 mt-1">
                      {!student.hasResume && <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded">No Resume</span>}
                      {student.profileStatus !== 'VERIFIED' && <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">Not Verified</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{student.department || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        student.readinessScore !== null 
                          ? student.readinessScore > 75 ? 'bg-emerald-100 text-emerald-700'
                          : student.readinessScore > 50 ? 'bg-blue-100 text-blue-700'
                          : student.readinessScore > 30 ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.readinessScore !== null ? Math.round(student.readinessScore) : '-'}
                      </div>
                      <div className="text-xs text-slate-500">
                        CGPA: <span className="font-bold text-slate-900">{student.cgpa?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 text-xs">
                      <div><span className="font-bold text-slate-900">{student.applicationsCount}</span> Apps</div>
                      <div><span className="font-bold text-indigo-600">{student.shortlistsCount}</span> Shortlists</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.interventionArea ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        {student.interventionArea}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">On Track</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length > 10 && (
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              {showAll ? 'Show Less' : `View All ${students.length} At-Risk Students`}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
