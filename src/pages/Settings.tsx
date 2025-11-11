import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/use-toast";
import { EstablishmentSettings } from "@/components/settings/EstablishmentSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { DataManagement } from "@/components/settings/DataManagement";
import { SpecificationGenerator } from "@/components/settings/SpecificationGenerator";
import { AppVersionInfo } from "@/components/settings/AppVersionInfo";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { DangerZone } from "@/components/settings/DangerZone";
import { SettingsFooter } from "@/components/settings/SettingsFooter";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";

const SettingsContent = ({ settings, onSettingsChange, handleSave, handleExport, handleClearAllData, hasUnsavedChanges, isSaving, inventory, sales, staff }) => {
  return (
    <>
      <Header />
      <main className="p-4 pb-32 animate-fade-in max-w-4xl mx-auto">
        <SettingsHeader 
          inventoryCount={inventory.length}
          salesCount={sales.length}
          staffCount={staff.length}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        <div className="space-y-6">
          <EstablishmentSettings 
            settings={settings}
            onSettingsChange={onSettingsChange}
          />

          <AppearanceSettings 
            settings={settings}
            onSettingsChange={onSettingsChange}
          />

          <DataManagement onExport={handleExport} />

          

          <SpecificationGenerator />

          <DangerZone 
            onClearAllData={handleClearAllData}
            inventoryCount={inventory.length}
            salesCount={sales.length}
            staffCount={staff.length}
          />

          <SettingsFooter 
            onSave={handleSave}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
          />
        </div>
      </main>
    </>
  );
};

const Settings = () => {
  const { 
    getSettings, 
    updateSettings, 
    clearAllData, 
    getInventory, 
    getSales, 
    getStaff,
    getTables,
    getCategories,
    getCashBalance,
    getCashTransactions
  } = useLocalData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState(() => getSettings());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const inventoryData = getInventory();
        const salesData = getSales();
        const staffData = getStaff();
        
        setInventory(inventoryData);
        setSales(salesData);
        setStaff(staffData);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading settings data:", error);
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, [getInventory, getSales, getStaff]);

  // Surveiller les changements et marquer comme non sauvegardé
  useEffect(() => {
    const currentSettings = getSettings();
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(currentSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, getSettings]);

  // Sauvegarder automatiquement après 2 secondes d'inactivité
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
          updateSettings(settings);
          setHasUnsavedChanges(false);
          toast({
            title: "✅ Sauvegarde automatique",
            description: "Vos paramètres ont été sauvegardés automatiquement.",
          });
        } catch (error) {
          toast({
            title: "❌ Erreur de sauvegarde",
            description: "Impossible de sauvegarder les paramètres automatiquement.",
            variant: "destructive"
          });
        } finally {
          setIsSaving(false);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [settings, hasUnsavedChanges, isSaving, updateSettings, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(settings);
      setHasUnsavedChanges(false);
      toast({
        title: "✅ Paramètres sauvegardés",
        description: "Vos préférences ont été mises à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced export with ALL data from localStorage
  const handleExport = () => {
    // Get all data functions
    const settings = getSettings();
    const inventory = getInventory();
    const sales = getSales();
    const staff = getStaff();
    const tables = getTables();
    const categories = getCategories();
    const cashBalance = getCashBalance();
    const cashTransactions = getCashTransactions();
    
    // Get ALL localStorage data to ensure nothing is missed
    const getAllLocalStorageData = () => {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              // Try to parse as JSON, fallback to raw string
              try {
                allData[key] = JSON.parse(value);
              } catch {
                allData[key] = value;
              }
            }
          } catch (error) {
            console.warn(`Erreur lors de la lecture de la clé ${key}:`, error);
          }
        }
      }
      return allData;
    };
    
    const allLocalStorageData = getAllLocalStorageData();

    // Calculate first and last dates
    const allDates = [
      ...inventory.map(item => new Date(item.createdAt)),
      ...sales.map(sale => new Date(sale.createdAt)),
      ...staff.map(member => new Date(member.createdAt))
    ].filter(date => !isNaN(date.getTime()));
    
    const firstDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
    const lastDate = new Date();

    // Temporal analysis
    const dailyRevenue: Record<string, number> = {};
    const monthlyRevenue: Record<string, number> = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      const dayKey = saleDate.toISOString().split('T')[0];
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
      
      dailyRevenue[dayKey] = (dailyRevenue[dayKey] || 0) + sale.total;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + sale.total;
    });

    // Top selling items analysis
    const itemSales: Record<string, { quantity: number; revenue: number; transactions: number }> = {};
    sales.forEach(sale => {
      if (!itemSales[sale.item]) {
        itemSales[sale.item] = { quantity: 0, revenue: 0, transactions: 0 };
      }
      itemSales[sale.item].quantity += sale.quantity;
      itemSales[sale.item].revenue += sale.total;
      itemSales[sale.item].transactions += 1;
    });

    const dataToExport = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "2.2.0",
        barName: settings.barName,
        exportType: "complete_backup",
        dataRange: {
          firstDate: firstDate.toISOString(),
          lastDate: lastDate.toISOString(),
          totalDays: Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        localStorageSize: localStorage.length
      },
      // TOUTES les données principales
      settings,
      inventory: inventory.map(item => ({
        ...item,
        totalValue: item.quantity * item.salePrice
      })),
      sales: sales.map(sale => ({
        ...sale,
        date: sale.date,
        createdAt: sale.createdAt
      })),
      staff,
      tables,
      categories,
      cashBalance,
      cashTransactions,
      // Données complémentaires
      inventoryHistory: allLocalStorageData.inventoryHistory || [],
      notifications: allLocalStorageData.notifications || [],
      // TOUTES les données du localStorage pour une sauvegarde complète
      completeLocalStorage: allLocalStorageData,
      // Analytics pour information
      analytics: {
        summary: {
          totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
          totalSales: sales.length,
          totalItems: inventory.length,
          totalStaff: staff.filter(s => s.isActive).length,
          averageOrderValue: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0,
          totalCategories: categories.length,
          totalTables: tables.length,
          cashBalance: cashBalance?.currentAmount || 0,
          totalCashTransactions: cashTransactions.length
        },
        temporal: {
          dailyRevenue,
          monthlyRevenue,
          peakDays: Object.entries(dailyRevenue)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([date, revenue]) => ({ date, revenue }))
        },
        products: {
          topSelling: Object.entries(itemSales)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, 20)
            .map(([name, data]) => ({ name, ...data })),
          inventoryValue: inventory.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0),
          lowStockItems: inventory.filter(item => item.quantity <= item.threshold).length
        }
      }
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barflow-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "📦 Export complet terminé",
      description: `Sauvegarde complète avec ${Object.keys(allLocalStorageData).length} éléments exportés.`,
    });
    
    return dataToExport;
  };

  const handleClearAllData = () => {
    clearAllData();
    toast({
      title: "🗑️ Données supprimées",
      description: "Toutes les données ont été supprimées définitivement.",
      variant: "destructive"
    });
    navigate("/");
  };

  const handleSettingsChange = (updates: any) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <SettingsContent 
        settings={settings}
        onSettingsChange={handleSettingsChange}
        handleSave={handleSave}
        handleExport={handleExport}
        handleClearAllData={handleClearAllData}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        inventory={inventory}
        sales={sales}
        staff={staff}
      />
    </PageWithSkeleton>
  );
};

export default Settings;
