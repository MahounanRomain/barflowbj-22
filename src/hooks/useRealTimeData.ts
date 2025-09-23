import { useState, useEffect, useCallback } from 'react';

interface UseRealTimeDataOptions {
  dataTypes: string[];
  refreshCallback: () => void;
}

export const useRealTimeData = ({ dataTypes, refreshCallback }: UseRealTimeDataOptions) => {
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const handleDataChange = useCallback(() => {
    setLastUpdate(new Date().toISOString());
    refreshCallback();
  }, [refreshCallback]);

  useEffect(() => {
    const listeners: Array<() => void> = [];

    dataTypes.forEach(dataType => {
      const eventName = `${dataType}Changed`;
      
      const listener = () => {
        console.log(`🔄 Real-time update: ${dataType} changed`);
        handleDataChange();
      };

      window.addEventListener(eventName, listener);
      listeners.push(() => window.removeEventListener(eventName, listener));
    });

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, [dataTypes, handleDataChange]);

  return { lastUpdate };
};