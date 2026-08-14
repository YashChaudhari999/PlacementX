import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Building2, Calendar, Users, Briefcase, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { useDrives } from '@/hooks/queries/useDrives';
import { ListSkeleton } from '@/components/common/Skeletons';
import { GenerateHrInviteModal } from '../components/GenerateHrInviteModal';
import { toast } from 'sonner';
import axios from 'axios';

interface Drive {
  id: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  jobRole: string;
  employmentType: string;
  fixedSalary?: number;
  status: string;
  registrationEnd?: string;
  applications?: any[];
}

export default function DriveList() {
  const { data: drives = [], isPending, error, refetch } = useDrives();
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteDrive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm("Are you sure you want to delete this drive?")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/drives/${id}`);
        toast.success("Drive deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error("Failed to delete drive");
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Drives</h1>
          <p className="text-slate-500 text-sm mt-1">Manage company visits and recruitment events.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsHrModalOpen(true)}
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/5"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Invite HR
          </Button>
          <Link to="/admin/placement-events/create">
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by company or role..." 
            className="pl-9 bg-slate-50 border-slate-200" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="h-10 rounded-md border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="published">Published</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline" className="text-slate-600">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Drives Grid */}
      {isPending ? (
        <ListSkeleton />
      ) : error ? (
        <div className="py-12 text-center text-red-500">Failed to load drives</div>
      ) : drives.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No drives created yet.</div>
      ) : (() => {
        const filteredDrives = drives.filter((drive: Drive) => {
          const matchesSearch = drive.company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = statusFilter === '' || drive.status.toLowerCase() === statusFilter.toLowerCase();
          return matchesSearch && matchesStatus;
        });

        if (filteredDrives.length === 0) {
          return <div className="py-12 text-center text-slate-500">No drives match your search filters.</div>;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDrives.map((drive: Drive) => (
              <Card key={drive.id} className="p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{drive.company.name}</h3>
                    <p className="text-sm text-primary font-medium">{drive.fixedSalary ? `${drive.fixedSalary} LPA` : "N/A"}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === drive.id ? null : drive.id);
                    }} 
                    className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {activeMenuId === drive.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-slate-200 z-10 py-1">
                      <Link to={`/admin/placement-events/edit/${drive.id}`} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</Link>
                      <button onClick={(e) => handleDeleteDrive(drive.id, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50">Delete</button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center text-sm text-slate-600">
                  <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                  {drive.jobRole} • {drive.employmentType}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {drive.registrationEnd ? new Date(drive.registrationEnd).toLocaleDateString() : "N/A"}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2 text-slate-400" />
                  {drive.applications?.length || 0} Applicants
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  drive.status === 'OPEN' || drive.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                  drive.status === 'UPCOMING' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {drive.status}
                </span>
                <Link to={`/admin/placement-events/${drive.id}`}>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
            ))}
          </div>
        );
      })()}

      <GenerateHrInviteModal 
        isOpen={isHrModalOpen} 
        onClose={() => setIsHrModalOpen(false)} 
      />
    </div>
  );
}
