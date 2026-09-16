import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useSettings, useUpdateRegional } from '../hooks/useSettings';
import { SettingsSkeleton } from '@/components/common/Skeletons';
import { Settings02Icon, Moon02Icon, Sun01Icon } from 'hugeicons-react';
import { useTheme } from '@/app/providers/ThemeProvider';

export default function AppearanceSettings() {
 const { data, isLoading } = useSettings();
 const {
 theme: globalTheme,
 setTheme: setGlobalTheme,
 compactMode: globalCompactMode,
 setCompactMode: setGlobalCompactMode,
 } = useTheme();
 const { mutate: updateRegional, isPending } = useUpdateRegional();

 const [theme, setTheme] = useState(globalTheme);
 const [compactMode, setCompactMode] = useState(globalCompactMode);

 useEffect(() => {
 if (data?.preferences) {
 setTheme(data.preferences.theme || 'system');
 setCompactMode(data.preferences.compactMode || false);
 }
 }, [data]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 // Optimistic UI update instantly for settings page
 setGlobalTheme(theme as any);
 setGlobalCompactMode(compactMode);

 updateRegional(
 { theme, compactMode },
 {
 onSuccess: () => {
 // Additional success logic if needed
 },
 }
 );
 };

 if (isLoading) return <SettingsSkeleton />;

 return (
 <Card className="p-6 border border-border/60 shadow-lg shadow-slate-200/40 bg-card/90 backdrop-blur-xl">
 <h3 className="font-bold text-foreground text-lg border-b border-border pb-4 mb-6">
 Appearance Settings
 </h3>
 <form onSubmit={handleSubmit} className="space-y-8">
 <div className="space-y-4">
 <label className="text-sm font-medium text-foreground">Interface Theme</label>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
 {/* System */}
 <button
 type="button"
 onClick={() => setTheme('system')}
 className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
 theme === 'system'
 ? 'border-primary bg-primary/5 text-primary'
 : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted'
 }`}
 >
 <Settings02Icon className="w-8 h-8"/>
 <span className="font-medium text-sm">System</span>
 </button>
 {/* Light */}
 <button
 type="button"
 onClick={() => setTheme('light')}
 className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
 theme === 'light'
 ? 'border-primary bg-primary/5 text-primary'
 : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted'
 }`}
 >
 <Sun01Icon className="w-8 h-8"/>
 <span className="font-medium text-sm">Light</span>
 </button>
 {/* Dark */}
 <button
 type="button"
 onClick={() => setTheme('dark')}
 className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
 theme === 'dark'
 ? 'border-primary bg-primary/5 text-primary'
 : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted'
 }`}
 >
 <Moon02Icon className="w-8 h-8"/>
 <span className="font-medium text-sm">Dark</span>
 </button>
 </div>
 <p className="text-xs text-muted-foreground mt-2">
 Select your preferred interface theme."System"will automatically match your OS
 settings.
 </p>
 </div>

 <div className="space-y-2 max-w-md pt-4 border-t border-border">
 <label className="flex items-center gap-3">
 <input
 type="checkbox"
 checked={compactMode}
 onChange={(e) => setCompactMode(e.target.checked)}
 className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
 />
 <span className="text-sm font-medium text-foreground">Compact Mode</span>
 </label>
 <p className="text-xs text-muted-foreground ml-7">
 When enabled, the interface will use tighter spacing and smaller text to show more
 information on screen.
 </p>
 </div>

 <div className="pt-4 border-t border-border flex justify-end max-w-md">
 <Button type="submit"disabled={isPending}>
 {isPending ? 'Saving...' : 'Save Appearance'}
 </Button>
 </div>
 </form>
 </Card>
 );
}
