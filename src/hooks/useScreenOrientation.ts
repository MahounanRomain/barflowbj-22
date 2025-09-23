import { useEffect } from 'react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

export const useScreenOrientation = () => {
  const lockToLandscape = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (error) {
        console.warn('Failed to lock screen orientation to landscape:', error);
      }
    }
  };

  const lockToPortrait = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        console.warn('Failed to lock screen orientation to portrait:', error);
      }
    }
  };

  const unlock = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.unlock();
      } catch (error) {
        console.warn('Failed to unlock screen orientation:', error);
      }
    }
  };

  return {
    lockToLandscape,
    lockToPortrait,
    unlock
  };
};