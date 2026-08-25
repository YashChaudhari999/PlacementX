import React from 'react';
import { Button } from '@/components/ui';
import { CheckCircle, Download, Mail, UserPlus, X } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onVerify: () => void;
  onProvision: () => void;
  onExport: () => void;
  onAlert: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onVerify,
  onProvision,
  onExport,
  onAlert
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 rounded-full bg-foreground/95 px-6 py-3 text-background shadow-2xl animate-in slide-in-from-bottom-8">
      <div className="flex items-center gap-3 pr-4 border-r border-background/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-sm font-medium">Students Selected</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-background hover:bg-background/20 hover:text-background h-8"
          onClick={onVerify}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-background hover:bg-background/20 hover:text-background h-8"
          onClick={onProvision}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Provision
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-background hover:bg-background/20 hover:text-background h-8"
          onClick={onAlert}
        >
          <Mail className="mr-2 h-4 w-4" />
          Alert
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-background hover:bg-background/20 hover:text-background h-8"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="pl-4 border-l border-background/20">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-background hover:bg-background/20 hover:text-background"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
