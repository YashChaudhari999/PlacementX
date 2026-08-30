import { Card, Badge } from '@/components/ui';
import {
  UserIcon,
  Mail01Icon,
  CallIcon,
  MapsLocation01Icon,
  Mortarboard01Icon,
  BookOpen01Icon,
} from 'hugeicons-react';

export function StudentHeaderCard({
  importedData,
  profileData,
}: {
  importedData: any;
  profileData: any;
}) {
  const getPlacementStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Unplaced':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Debarred':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Higher Studies':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0 overflow-hidden">
            {profileData?.photoUrl ? (
              <img
                src={profileData.photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{importedData.fullName}</h1>
              <Badge
                className={getPlacementStatusColor(importedData.placementStatus || 'Unplaced')}
              >
                {importedData.placementStatus || 'Unplaced'}
              </Badge>
              {profileData?.isProfileComplete && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">Profile Complete</Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Mail01Icon className="w-4 h-4 text-gray-400" />
                <span>{importedData.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen01Icon className="w-4 h-4 text-gray-400" />
                <span>{importedData.studentId}</span>
              </div>
              {profileData?.phone && (
                <div className="flex items-center gap-1.5">
                  <CallIcon className="w-4 h-4 text-gray-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData?.address && (
                <div className="flex items-center gap-1.5">
                  <MapsLocation01Icon className="w-4 h-4 text-gray-400" />
                  <span>{profileData.address.split(',')[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:border-l md:border-gray-100 md:pl-6">
          <div className="text-center px-4">
            <p className="text-sm font-medium text-gray-500 mb-1">CGPA</p>
            <p className="text-2xl font-bold text-gray-900">
              {importedData.cgpa ? importedData.cgpa.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="text-center px-4 border-l border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Backlogs</p>
            <p
              className={`text-2xl font-bold ${importedData.activeBacklogs > 0 ? 'text-red-600' : 'text-gray-900'}`}
            >
              {importedData.activeBacklogs || 0}
            </p>
          </div>
          <div className="text-center px-4 border-l border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Offers</p>
            <p className="text-2xl font-bold text-gray-900">
              {profileData?.applications?.filter((a: any) => a.offerLetter).length || 0}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
