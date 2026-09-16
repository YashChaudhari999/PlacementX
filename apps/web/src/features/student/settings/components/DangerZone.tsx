import { Card, Button } from '@/components/ui';
import { useExportData, useRequestDeactivation } from '../hooks/useSettings';
import { Alert01Icon, Download01Icon, UserMinus01Icon } from 'hugeicons-react';

export default function DangerZone() {
 const { mutate: exportData, isPending: isExporting } = useExportData();
 const { mutate: requestDeactivation, isPending: isDeactivating } = useRequestDeactivation();

 const handleDeactivate = () => {
 if (
 window.confirm(
 'Are you sure you want to request account deactivation? You will lose access to placement drives.'
 )
 ) {
 requestDeactivation();
 }
 };

 return (
 <div className="space-y-6">
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-info-muted text-info rounded-xl shrink-0">
 <Download01Icon className="w-6 h-6"/>
 </div>
 <div className="flex-1">
 <h3 className="font-bold text-foreground text-lg">Export Data</h3>
 <p className="text-sm text-muted-foreground mt-1 mb-4">
 Download a copy of all your personal data, including profile information,
 applications, and documents currently stored on PlacementX.
 </p>
 <Button variant="outline"onClick={() => exportData()} disabled={isExporting}>
 {isExporting ? 'Generating...' : 'Request Data Export'}
 </Button>
 </div>
 </div>
 </Card>

 <Card className="p-6 border border-red-200 shadow-lg shadow-red-100/50 bg-destructive-muted/30 backdrop-blur-xl">
 <div className="flex items-start gap-4">
 <div className="p-3 bg-red-100 text-destructive rounded-xl shrink-0">
 <Alert01Icon className="w-6 h-6"/>
 </div>
 <div className="flex-1">
 <h3 className="font-bold text-red-900 text-lg">Deactivate Account</h3>
 <p className="text-sm text-red-800/80 mt-1 mb-4">
 Request to deactivate your account. This will remove your access to the portal and
 withdraw you from all active placement drives. A placement coordinator must approve
 this request.
 </p>
 <Button variant="destructive"onClick={handleDeactivate} disabled={isDeactivating}>
 {isDeactivating ? 'Requesting...' : 'Request Deactivation'}
 </Button>
 </div>
 </div>
 </Card>
 </div>
 );
}
