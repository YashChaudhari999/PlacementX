import React, { useState } from 'react';
import SettingsSidebar from '../components/settings/SettingsSidebar';
import GeneralSettings from '../components/settings/GeneralSettings';
import PlacementSettings from '../components/settings/PlacementSettings';
import StudentSettings from '../components/settings/StudentSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import SystemHealth from '../components/settings/SystemHealth';
import DangerZone from '../components/settings/DangerZone';
import { useSettings } from '@/hooks/useSettings';
import { useAuthStore } from '@/stores/authStore';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { settings, getValue, handleChange, saveChanges, hasUnsavedChanges, saving, loading } =
    useSettings();

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading settings...</div>;
  }

  // Handle unsaved changes warning before switching tabs
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to switch tabs without saving?'
        )
      ) {
        // Discarding could be implemented here or just ignore and keep them in state
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  };

  const renderContent = () => {
    const props = { settings, getValue, handleChange, saveChanges, hasUnsavedChanges, saving };

    switch (activeTab) {
      case 'general':
        return <GeneralSettings {...props} />;
      case 'placement':
        return <PlacementSettings {...props} />;
      case 'students':
        return <StudentSettings {...props} />;
      case 'communications':
        return <NotificationSettings {...props} />;
      case 'security':
        return isSuperAdmin ? (
          <SecuritySettings />
        ) : (
          <div className="p-8 text-center text-slate-500">Access Denied</div>
        );
      case 'system':
        return <SystemHealth />;
      case 'advanced':
        return isSuperAdmin ? (
          <DangerZone />
        ) : (
          <div className="p-8 text-center text-slate-500">Access Denied</div>
        );
      default:
        return <div className="p-8 text-center text-slate-500">Select a category</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Administration Control Center</h1>
        <p className="text-slate-500">Centralized configuration, security, and placement rules.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <SettingsSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 w-full min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
