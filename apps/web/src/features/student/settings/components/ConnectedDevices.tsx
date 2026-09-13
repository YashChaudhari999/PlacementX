import { Card, Button } from '@/components/ui';
import { useDevices, useDeleteDevice } from '../hooks/useSettings';
import { Loading } from '@/components/common/Loading';
import { SmartPhone01Icon, Globe02Icon } from 'hugeicons-react';
import { format } from 'date-fns';

export default function ConnectedDevices() {
  const { data: devices, isLoading, isError } = useDevices();
  const { mutate: deleteDevice, isPending } = useDeleteDevice();

  if (isLoading) return <Loading />;
  if (isError || !devices) return <div>Failed to load devices</div>;

  return (
    <Card className="p-6 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/90 backdrop-blur-xl">
      <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-6">
        Connected Devices
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        These are devices that currently receive push notifications from PlacementX. Revoke access if you no longer recognize a device.
      </p>

      {devices.length === 0 ? (
        <div className="text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
          <SmartPhone01Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No connected devices found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device: any) => (
            <div key={device.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                  {device.platform?.toLowerCase().includes('web') ? (
                    <Globe02Icon className="w-6 h-6" />
                  ) : (
                    <SmartPhone01Icon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{device.deviceName || 'Unknown Device'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform: {device.platform || 'Web/PWA'} • Last updated: {format(new Date(device.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteDevice(device.id)}
                disabled={isPending}
              >
                Revoke
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
