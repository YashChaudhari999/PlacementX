import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, any>>({});

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      setSettings(data);
      setUnsavedChanges({});
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setUnsavedChanges((prev) => ({ ...prev, [key]: value }));
  };

  const saveChanges = async (keysToSave?: string[]) => {
    const updates = keysToSave
      ? Object.fromEntries(
          Object.entries(unsavedChanges).filter(([key]) => keysToSave.includes(key))
        )
      : unsavedChanges;

    if (Object.keys(updates).length === 0) return;

    try {
      setSaving(true);
      const { data } = await api.patch('/admin/settings', updates);
      setSettings(data.settings);

      // Remove saved keys from unsavedChanges
      setUnsavedChanges((prev) => {
        const next = { ...prev };
        Object.keys(updates).forEach((key) => delete next[key]);
        return next;
      });

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = (keysToDiscard?: string[]) => {
    setUnsavedChanges((prev) => {
      if (!keysToDiscard) return {};
      const next = { ...prev };
      keysToDiscard.forEach((key) => delete next[key]);
      return next;
    });
  };

  const getValue = (key: string) => {
    if (unsavedChanges[key] !== undefined) return unsavedChanges[key];
    return settings[key];
  };

  return {
    settings,
    unsavedChanges,
    loading,
    saving,
    getValue,
    handleChange,
    saveChanges,
    discardChanges,
    hasUnsavedChanges: Object.keys(unsavedChanges).length > 0,
  };
};
