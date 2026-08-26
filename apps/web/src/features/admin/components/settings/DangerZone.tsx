import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function DangerZone() {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    if (!window.confirm('Are you absolutely sure? This will archive all current placement data and prepare the system for a new academic year. This cannot be undone easily.')) {
      return;
    }
    setLoading(true);
    try {
      // Stub
      await new Promise(r => setTimeout(r, 1000));
      toast.success('System archived for new academic year');
    } catch (e) {
      toast.error('Failed to archive system');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-red-200">
      <div className="flex items-center gap-2 mb-6 border-b border-red-100 pb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="font-bold text-red-700 text-lg">Danger Zone</h3>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="mb-4 sm:mb-0">
            <h4 className="text-sm font-bold text-red-800">Archive Academic Year</h4>
            <p className="text-xs text-red-600 mt-1 max-w-lg">
              Archives all current student applications, drives, and offers. 
              Only use this at the end of the placement season to prepare for the next batch.
            </p>
          </div>
          <Button variant="danger" onClick={handleArchive} disabled={loading}>
            Archive System
          </Button>
        </div>
      </div>
    </Card>
  );
}
