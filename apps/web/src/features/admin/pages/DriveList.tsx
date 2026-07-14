import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Building2, Calendar, Users, Briefcase, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import axios from 'axios';
import { GenerateHrInviteModal } from '../components/GenerateHrInviteModal';

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
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHrModalOpen, setIsHrModalOpen] = useState(false);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/drives');
        setDrives(res.data);
      } catch (err: any) {
        console.error("Fetch drives error:", err);
        setError(err.response?.data?.message || "Failed to load drives");
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

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
          <Input placeholder="Search by company or role..." className="pl-9 bg-slate-50 border-slate-200" />
        </div>
        <div className="flex gap-4">
          <select className="h-10 rounded-md border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading drives...</div>
        ) : error ? (
          <div className="col-span-full py-12 text-center text-red-500">{error}</div>
        ) : drives.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No drives created yet.</div>
        ) : drives.map(drive => (
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
              <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
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

      <GenerateHrInviteModal 
        isOpen={isHrModalOpen} 
        onClose={() => setIsHrModalOpen(false)} 
      />
    </div>
  );
}
