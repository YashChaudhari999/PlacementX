import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Activity, Database, Server, RefreshCcw } from 'lucide-react';
import api from '@/lib/api';

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings/health');
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-slate-800 text-lg">System Health & Integrations</h3>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="text-slate-500 hover:text-primary transition-colors"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${health?.database === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-800">Primary Database</h4>
              <p className="text-xs text-slate-500">PostgreSQL (Supabase)</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${health?.database === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {health?.database === 'up' ? 'OPERATIONAL' : 'OFFLINE'}
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${health?.redis === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-800">Cache & Queues</h4>
              <p className="text-xs text-slate-500">Redis Server</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${health?.redis === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {health?.redis === 'up' ? 'OPERATIONAL' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {health?.timestamp && (
        <p className="text-xs text-slate-400 mt-6 text-center">
          Last checked: {new Date(health.timestamp).toLocaleString()}
        </p>
      )}
    </Card>
  );
}
