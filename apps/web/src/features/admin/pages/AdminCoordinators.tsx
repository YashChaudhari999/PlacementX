import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, Input, Button } from '@/components/ui';
import { toast } from 'sonner';
import { Users, Plus, Shield, Mail, Search } from 'lucide-react';

export default function AdminCoordinators() {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add modal state
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await api.get('/admin/coordinators');
      setCoordinators(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load coordinators');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coordinators', formData);
      toast.success('Coordinator added successfully');
      setShowAdd(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
      fetchCoordinators();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add coordinator');
    }
  };

  const filtered = coordinators.filter(
    (c) =>
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Coordinators</h1>
          <p className="text-slate-500">Manage staff with coordinator access to the platform.</p>
        </div>
        <div className="flex gap-4">
          <div className="w-64">
            <Input
              leftIcon={<Search className="w-4 h-4" />}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 mr-2" /> Add Coordinator
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="p-6 bg-slate-50 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Coordinator</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Temporary Password</label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            No coordinators found.
          </div>
        ) : (
          filtered.map((coordinator) => (
            <Card
              key={coordinator.id}
              className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {coordinator.firstName[0]}
                    {coordinator.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {coordinator.firstName} {coordinator.lastName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                      <Shield className="w-3 h-3" /> Coordinator
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> {coordinator.email}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Joined: {new Date(coordinator.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
