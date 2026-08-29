import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone01Icon, Calendar01Icon, Time01Icon, Layout01Icon, SentIcon, InboxIcon } from 'hugeicons-react';
import NotificationDashboard from './notifications/NotificationDashboard';
import NotificationComposer from './notifications/NotificationComposer';
import NotificationHistory from './notifications/NotificationHistory';
import NotificationScheduled from './notifications/NotificationScheduled';
import NotificationTemplates from './notifications/NotificationTemplates';
import NotificationInbox from './notifications/NotificationInbox';

export default function AdminNotifications() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Default to overview tab
  const currentTab = searchParams.get('tab') || 'overview';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Megaphone01Icon },
    { id: 'inbox', label: 'InboxIcon', icon: InboxIcon },
    { id: 'send', label: 'SentIcon Notification', icon: SentIcon },
    { id: 'history', label: 'Sent Time01Icon', icon: Time01Icon },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar01Icon },
    { id: 'templates', label: 'Templates', icon: Layout01Icon },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Communicate placement updates and important alerts to the right students at the right
            time.
          </p>
        </div>
        {currentTab !== 'send' && (
          <button
            onClick={() => setTab('send')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
          >
            <SentIcon className="w-4 h-4" />
            SentIcon Notification
          </button>
        )}
      </div>

      {/* ─── Tabs Navigation ───────────────────────────────────────────── */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ───────────────────────────────────────────────── */}
      <div className="mt-6">
        {currentTab === 'overview' && <NotificationDashboard onNavigate={setTab} />}
        {currentTab === 'inbox' && <NotificationInbox />}
        {currentTab === 'send' && <NotificationComposer onComplete={() => setTab('overview')} />}
        {currentTab === 'history' && <NotificationHistory />}
        {currentTab === 'scheduled' && <NotificationScheduled />}
        {currentTab === 'templates' && <NotificationTemplates />}
      </div>
    </div>
  );
}
