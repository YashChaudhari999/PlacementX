import { useState } from 'react';
import { BarChart3, FileSpreadsheet, History, Bookmark, ChevronRight } from 'lucide-react';
import ReportsOverview from '../components/reports/ReportsOverview';
import ReportBuilder from '../components/reports/ReportBuilder';
import ReportHistory from '../components/reports/ReportHistory';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'history' | 'saved'>(
    'overview'
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'builder', label: 'Report Builder', icon: FileSpreadsheet },
    { id: 'history', label: 'Export History', icon: History },
    { id: 'saved', label: 'Saved Templates', icon: Bookmark },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Placement Intelligence & Reporting</h1>
        <p className="text-muted-foreground mt-1">
          Generate, schedule, and analyze placement reports for operational and executive insights.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  whitespace-nowrap flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon
                  className={`mr-2 h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <ReportsOverview onNavigateToBuilder={() => setActiveTab('builder')} />
        )}
        {activeTab === 'builder' && <ReportBuilder />}
        {activeTab === 'history' && <ReportHistory />}
        {activeTab === 'saved' && (
          <div className="p-8 text-center text-muted-foreground">
            Saved Templates feature coming soon. Use Report Builder to generate reports for now.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
