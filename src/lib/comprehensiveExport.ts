import { storage } from './storage';

/**
 * Comprehensive export of ALL application data
 * Version 3.0 - Complete application state export
 */

export const exportCompleteData = () => {
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split('T')[0];
  const timeStr = timestamp.split('T')[1].split('.')[0].replace(/:/g, '-');

  // Get ALL localStorage data
  const completeData: Record<string, any> = {};
  
  // List of all known data keys in the application
  const dataKeys = [
    'inventory',
    'sales',
    'staff',
    'settings',
    'categories',
    'tables',
    'cashBalance',
    'cashTransactions',
    'inventoryHistory',
    'damageReports',
    'restockHistory',
    'dailyArchive',
    'lastDailyReset',
    'app_initialized',
    'app_notifications',
    'quickAccessItems',
    'userPreferences',
    'recentSearches',
    'favorites'
  ];

  // Collect all data
  dataKeys.forEach(key => {
    const data = storage.load(key);
    if (data !== null && data !== undefined) {
      completeData[key] = data;
    }
  });

  // Also capture any additional keys in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !dataKeys.includes(key) && !key.startsWith('__')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          completeData[key] = JSON.parse(value);
        }
      } catch {
        // Skip non-JSON values
      }
    }
  }

  // Create export package with metadata
  const exportPackage = {
    exportInfo: {
      version: '3.0.0',
      timestamp,
      dateStr,
      timeStr,
      appName: 'BarFlow',
      dataKeys: Object.keys(completeData),
      totalKeys: Object.keys(completeData).length,
      exportType: 'complete'
    },
    completeLocalStorage: completeData,
    metadata: {
      inventoryCount: Array.isArray(completeData.inventory) ? completeData.inventory.length : 0,
      salesCount: Array.isArray(completeData.sales) ? completeData.sales.length : 0,
      staffCount: Array.isArray(completeData.staff) ? completeData.staff.length : 0,
      categoriesCount: Array.isArray(completeData.categories) ? completeData.categories.length : 0,
      tablesCount: Array.isArray(completeData.tables) ? completeData.tables.length : 0,
      totalCashBalance: completeData.cashBalance || 0,
      lastReset: completeData.lastDailyReset || null
    }
  };

  // Generate download
  const dataStr = JSON.stringify(exportPackage, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const fileName = `BarFlow_Complete_Export_${dateStr}_${timeStr}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    fileName,
    totalKeys: Object.keys(completeData).length,
    metadata: exportPackage.metadata
  };
};

/**
 * Import complete data with validation and conflict resolution
 */
export const importCompleteData = (data: any): {
  success: boolean;
  message: string;
  details: {
    imported: number;
    skipped: number;
    errors: string[];
  };
} => {
  const result = {
    success: false,
    message: '',
    details: {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }
  };

  try {
    // Validate export package structure
    if (!data.exportInfo || !data.completeLocalStorage) {
      throw new Error('Format d\'export invalide - données corrompues');
    }

    const { version, appName } = data.exportInfo;
    
    // Version compatibility check - accept both BarFlow and BarFlowTrack for backward compatibility
    if (!version || !appName || (appName !== 'BarFlow' && appName !== 'BarFlowTrack')) {
      result.details.errors.push('Format non reconnu ou version incompatible');
    }

    const dataToImport = data.completeLocalStorage;
    
    // Import all data with error handling
    Object.entries(dataToImport).forEach(([key, value]) => {
      try {
        storage.save(key, value);
        result.details.imported++;
      } catch (error) {
        result.details.skipped++;
        result.details.errors.push(`Échec import ${key}: ${error}`);
      }
    });

    // Dispatch events for real-time updates
    const criticalKeys = ['inventory', 'sales', 'staff', 'cashBalance', 'tables'];
    criticalKeys.forEach(key => {
      if (dataToImport[key]) {
        window.dispatchEvent(new CustomEvent(`${key}Changed`));
      }
    });

    result.success = true;
    result.message = `Import réussi: ${result.details.imported} éléments importés`;
    
    if (result.details.errors.length > 0) {
      result.message += ` (${result.details.skipped} ignorés)`;
    }

  } catch (error) {
    result.success = false;
    result.message = `Erreur critique: ${error}`;
    result.details.errors.push(String(error));
  }

  return result;
};

/**
 * Validate import data before importing
 */
export const validateImportData = (data: any): {
  valid: boolean;
  warnings: string[];
  info: Record<string, any>;
} => {
  const warnings: string[] = [];
  const info: Record<string, any> = {};

  // Check if it's our export format
  if (data.exportInfo && data.completeLocalStorage) {
    info.version = data.exportInfo.version;
    info.exportDate = data.exportInfo.timestamp;
    info.totalKeys = data.exportInfo.totalKeys;
    
    if (data.metadata) {
      info.inventoryCount = data.metadata.inventoryCount;
      info.salesCount = data.metadata.salesCount;
      info.staffCount = data.metadata.staffCount;
    }
  } else if (data.inventory || data.sales || data.staff) {
    // Legacy format
    warnings.push('Format d\'export ancien détecté - import partiel possible');
    info.version = 'legacy';
  } else {
    warnings.push('Format non reconnu - risque d\'erreurs');
    info.version = 'unknown';
  }

  return {
    valid: warnings.length === 0 || info.version === 'legacy',
    warnings,
    info
  };
};
