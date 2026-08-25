import { Card, Button, Input } from '@/components/ui';
import { useNotificationTemplates } from '@/hooks/queries/useAdminNotifications';
import { 
  LayoutTemplate, Search, Plus, Edit2, Copy, Trash2, Star 
} from 'lucide-react';
import { useState } from 'react';

export default function NotificationTemplates() {
  const { data: res, isLoading, isError, error } = useNotificationTemplates();
  const templates = res?.data || [];
  const [search, setSearch] = useState('');

  const filteredTemplates = templates.filter((t: any) => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search templates..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white"
          />
        </div>
        <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white flex gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-slate-400">Loading templates...</div>
        ) : isError ? (
          <div className="col-span-full p-8 text-center text-red-500">
            Error: {(error as any)?.response?.data?.message || (error as any)?.message || 'Failed to load templates'}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-500 flex flex-col items-center justify-center">
            <LayoutTemplate className="w-10 h-10 mb-3 text-slate-300" />
            <h4 className="text-base font-semibold text-slate-700">No templates found</h4>
            <p className="text-sm mt-1">Create a reusable template for common notifications.</p>
          </div>
        ) : (
          filteredTemplates.map((template: any) => (
            <Card key={template.id} className="border-slate-200 shadow-sm flex flex-col transition-shadow hover:shadow-md">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{template.name}</h3>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{template.category}</div>
                </div>
                <button className={`p-1.5 rounded-full ${template.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'}`}>
                  <Star className="w-4 h-4" fill={template.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="p-5 flex-1 bg-slate-50/50">
                <div className="text-sm font-semibold text-slate-800 mb-1">{template.title}</div>
                <div className="text-sm text-slate-600 line-clamp-3">{template.message}</div>
                
                {/* Variables Display */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {(template.message.match(/{{.*?}}/g) || []).map((v: string, i: number) => (
                    <span key={i} className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  Use Template
                </Button>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded" title="Duplicate">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
