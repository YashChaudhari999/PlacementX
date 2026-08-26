import React from 'react';
import { 
  Globe, Shield, Database, Bell, GraduationCap, Users, Activity, Settings as SettingsIcon, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const SETTINGS_CATEGORIES = [
  { id: 'general', label: 'General', icon: Globe, restricted: false },
  { id: 'placement', label: 'Placement Rules', icon: Database, restricted: false },
  { id: 'students', label: 'Students', icon: GraduationCap, restricted: false },
  { id: 'communications', label: 'Communications', icon: Bell, restricted: false },
  { id: 'security', label: 'Security & Access', icon: Shield, restricted: true },
  { id: 'system', label: 'System Health', icon: Activity, restricted: false },
  { id: 'advanced', label: 'Advanced', icon: AlertTriangle, restricted: true, danger: true },
];

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SettingsSidebar({ activeTab, setActiveTab, searchQuery, setSearchQuery }: SettingsSidebarProps) {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const visibleCategories = SETTINGS_CATEGORIES.filter(c => {
    if (c.restricted && !isSuperAdmin) return false;
    if (searchQuery) {
      return c.label.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-64 flex-shrink-0 flex flex-col space-y-4">
      <div className="relative">
        <input 
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-9 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <SettingsIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
      </div>

      <nav className="space-y-1">
        {visibleCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === category.id 
                ? category.danger 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <category.icon className={`w-4 h-4 ${activeTab === category.id && category.danger ? 'text-red-600' : ''}`} />
            {category.label}
          </button>
        ))}
        {visibleCategories.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No categories match your search.</p>
        )}
      </nav>
    </div>
  );
}
