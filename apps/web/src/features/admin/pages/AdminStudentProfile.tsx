import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { Card, Button, Badge } from '@/components/ui';
import { ArrowLeft01Icon, MoreVerticalIcon, UserIcon } from 'hugeicons-react';
import { Loading } from '@/components/common/Loading';
import { toast } from 'sonner';

import { StudentHeaderCard } from '../components/student-detail/StudentHeaderCard';
import { TabOverview } from '../components/student-detail/TabOverview';
import { TabAcademic } from '../components/student-detail/TabAcademic';
import { TabProfile } from '../components/student-detail/TabProfile';
import { TabPlacements } from '../components/student-detail/TabPlacements';
import { TabDocuments } from '../components/student-detail/TabDocuments';
import { TabActivity } from '../components/student-detail/TabActivity';
import { TabNotes } from '../components/student-detail/TabNotes';

export default function AdminStudentProfile() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStudentById(studentId!);
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load student details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  if (loading) {
    return <Loading />;
  }

  if (!data || !data.importedData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800">Student Not Found</h2>
        <p className="text-gray-500 mt-2">The requested student profile could not be loaded.</p>
        <Button onClick={() => navigate('/admin/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  const { importedData, profileData } = data;

  const tabs = ['Overview', 'Academic', 'Profile', 'Placements', 'Documents', 'Activity', 'Notes'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header section with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/students')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft01Icon className="w-4 h-4 mr-1" />
          Back to Students
        </button>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            Edit Student
          </Button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVerticalIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <StudentHeaderCard importedData={importedData} profileData={profileData} />

      {/* Main content tabs */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 min-h-[500px]">
          {activeTab === 'Overview' && (
            <TabOverview importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Academic' && (
            <TabAcademic importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Profile' && (
            <TabProfile importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Placements' && (
            <TabPlacements importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Documents' && (
            <TabDocuments importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Activity' && (
            <TabActivity importedData={importedData} profileData={profileData} />
          )}
          {activeTab === 'Notes' && (
            <TabNotes
              studentId={studentId!}
              importedData={importedData}
              profileData={profileData}
              reload={loadStudentData}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
