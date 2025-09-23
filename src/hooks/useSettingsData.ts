
import React, { useCallback } from 'react';
import { storage, BarSettings } from '@/lib/storage';

export const useSettingsData = () => {
  const getSettings = useCallback((): BarSettings => {
    return storage.load<BarSettings>('settings') || {
      barName: '',
      address: '',
      phone: '',
      email: 'romainmahougnon@gmail.com',
      darkMode: true,
      notifications: true,
      lowStockAlerts: true
    };
  }, []);

  const saveSettings = useCallback((settings: BarSettings) => {
    storage.save('settings', settings);
  }, []);

  const updateSettings = useCallback((updates: Partial<BarSettings>) => {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...updates };
    saveSettings(newSettings);
    window.dispatchEvent(new CustomEvent('settingsChanged'));
    return newSettings;
  }, [getSettings, saveSettings]);

  return {
    getSettings,
    updateSettings
  };
};
