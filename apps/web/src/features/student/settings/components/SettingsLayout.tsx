import { useState } from 'react';
import { Card } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle02Icon,
  Briefcase02Icon,
  Notification02Icon,
  Shield01Icon,
  Settings02Icon,
  HelpCircleIcon,
  PaintBoardIcon,
} from 'hugeicons-react';
import AccountSettings from './AccountSettings';
import ProfilePreferences from './ProfilePreferences';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import ApplicationPreferences from './ApplicationPreferences';
import AppearanceSettings from './AppearanceSettings';
import HelpSupport from './HelpSupport';

const SIDEBAR_TABS = [
  { id: 'account', label: 'Account', icon: UserCircle02Icon },
  { id: 'profile', label: 'Profile & Placement', icon: Briefcase02Icon },
  { id: 'notifications', label: 'Notifications', icon: Notification02Icon },
  { id: 'security', label: 'Security', icon: Shield01Icon },
  { id: 'application', label: 'Application Preferences', icon: Settings02Icon },
  { id: 'appearance', label: 'Appearance', icon: PaintBoardIcon },
  { id: 'support', label: 'Help & Support', icon: HelpCircleIcon },
];

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('account');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'account': return <AccountSettings />;
      case 'profile': return <ProfilePreferences />;
      case 'notifications': return <NotificationSettings />;
      case 'security': return <SecuritySettings />;
      case 'application': return <ApplicationPreferences />;
      case 'appearance': return <AppearanceSettings />;
      case 'support': return <HelpSupport />;
      default: return <AccountSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-3xl backdrop-blur-md border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings Center
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Manage your account, preferences, and security.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <Card className="w-full lg:w-72 shrink-0 p-3 bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/40 rounded-2xl sticky top-24">
          <nav className="space-y-1">
            {SIDEBAR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? (tab.danger ? 'bg-red-50 text-red-700 shadow-sm border border-red-100' : 'bg-white text-primary shadow-sm border border-slate-200') 
                      : (tab.danger ? 'text-red-600 hover:bg-red-50/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? (tab.danger ? 'text-red-600' : 'text-primary') : 'text-slate-400'}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
