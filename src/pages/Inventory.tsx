import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Package, TrendingDown, AlertTriangle, Filter, History, TreePine, FileX } from "lucide-react";
import { LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import AddInventoryDialog from "@/components/AddInventoryDialog";
import InventoryItem from "@/components/InventoryItem";
import CategoryManager from "@/components/CategoryManager";
import HierarchicalCategoryView from "@/components/HierarchicalCategoryView";
import OptimizedRestockHistory from "@/components/inventory/OptimizedRestockHistory";
import DamageReportDialog from "@/components/inventory/DamageReportDialog";
import DamageReportsHistory from "@/components/inventory/DamageReportsHistory";
import { Button } from "@/components/ui/button";
import { SimpleNumericInput } from "@/components/ui/simple-numeric-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocalData } from "@/hooks/useLocalData";
import { PageWithSkeleton } from "@/components/PageWithSkeleton";
import { useSkeletonLoading } from "@/hooks/useSkeletonLoading";
import { useRealTimeData } from "@/hooks/useRealTimeData";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  textColor: string;
}

const InventoryContent = () => {
  const { getInventory, getCategories } = useLocalData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const inventoryData = getInventory();
      const categoriesData = getCategories();
      setInventory(inventoryData);
      setCategories(categoriesData);
      if (!isDataLoaded) {
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Error loading inventory data:", error);
      if (!isDataLoaded) {
        setIsDataLoaded(true);
      }
    }
  }, [getInventory, getCategories, isDataLoaded]);

  // Listen for real-time data changes
  useRealTimeData({
    dataTypes: ['inventory', 'categories', 'inventoryHistory'],
    refreshCallback: loadData
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Toutes" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, selectedCategory]);

  const inventoryStats = useMemo(() => {
    // Filter out parent categories and only show subcategories
    const subcategories = categories.filter(cat => !cat.isParent);
    return {
      lowStockItems: inventory.filter(item => item.quantity <= item.threshold),
      outOfStockItems: inventory.filter(item => item.quantity === 0),
      categoryOptions: ["Toutes", ...subcategories.map(cat => cat.name)]
    };
  }, [inventory, categories]);

  const EmptyState = React.memo<EmptyStateProps>(({ icon: Icon, title, description }) => (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10 animate-fade-in">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4 animate-scale-in">
          <Icon size={32} className="text-muted-foreground" />
        </div>
        <CardTitle className="mb-2 text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground max-w-sm">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  ));

  const StatCard = React.memo<StatCardProps>(({ title, value, icon: Icon, gradient, textColor }) => (
    <Card className={`${gradient} border-opacity-50 animate-fade-in hover:scale-105 transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium ${textColor}`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor.replace('400', '900').replace('600', '100')}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${textColor.replace('400', '500').replace('600', '500')}`} />
        </div>
      </CardContent>
    </Card>
  ));

  const InventoryList = React.memo(() => (
    <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}`}>
      {filteredInventory.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="Aucun article trouvé"
          description={inventory.length === 0 
            ? "Commencez par ajouter votre premier article d'inventaire" 
            : "Aucun article ne correspond à vos critères de recherche"
          }
        />
      ) : (
        filteredInventory.map((item) => (
          <div key={item.id} className="animate-fade-in">
            <InventoryItem
              id={item.id}
              name={item.name}
              category={item.category}
              quantity={item.quantity}
              unit={item.unit}
              threshold={item.threshold}
              purchasePrice={item.purchasePrice}
              salePrice={item.salePrice}
              containerType={item.containerType}
              minQuantity={item.minQuantity}
              categories={categories}
            />
          </div>
        ))
      )}
    </div>
  ));

  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  if (isSkeletonLoading) {
    return null; // PageWithSkeleton will handle the skeleton display
  }

  return (
    <div className="mobile-container bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
        <Header 
          rightContent={
            <div className="flex items-center gap-2">
              <DamageReportDialog />
              <CategoryManager />
              <AddInventoryDialog />
            </div>
          }
        />

      <main className="px-4 py-6 space-y-6 pb-24">
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Inventaire</h1>
              <p className="text-muted-foreground">Gérez votre stock et suivez vos produits</p>
            </div>
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value)}
              className="bg-muted/50 p-1 rounded-lg"
            >
              <ToggleGroupItem 
                value="list" 
                aria-label="Vue liste" 
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 hover:scale-105"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="21" y1="6" y2="6"/>
                  <line x1="8" x2="21" y1="12" y2="12"/>
                  <line x1="8" x2="21" y1="18" y2="18"/>
                  <line x1="3" x2="3.01" y1="6" y2="6"/>
                  <line x1="3" x2="3.01" y1="12" y2="12"/>
                  <line x1="3" x2="3.01" y1="18" y2="18"/>
                </svg>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="grid" 
                aria-label="Vue grille" 
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground transition-all duration-200 hover:scale-105"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total"
              value={inventory.length}
              icon={Package}
              gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800"
              textColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Stock Faible"
              value={inventoryStats.lowStockItems.length}
              icon={TrendingDown}
              gradient="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800"
              textColor="text-orange-600 dark:text-orange-400"
            />
            <StatCard
              title="Épuisé"
              value={inventoryStats.outOfStockItems.length}
              icon={AlertTriangle}
              gradient="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800"
              textColor="text-red-600 dark:text-red-400"
            />
            <StatCard
              title="Catégories"
              value={categories.filter(cat => !cat.isParent).length}
              icon={Filter}
              gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800"
              textColor="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 h-12 p-1 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="inventory" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <Package size={16} />
              <span className="hidden sm:inline">Stock</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <TreePine size={16} />
              <span className="hidden sm:inline">Catégories</span>
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <TrendingDown size={16} />
              <span className="hidden sm:inline">Faible</span>
            </TabsTrigger>
            <TabsTrigger value="out-stock" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <AlertTriangle size={16} />
              <span className="hidden sm:inline">Épuisé</span>
            </TabsTrigger>
            <TabsTrigger value="damage-reports" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <FileX size={16} />
              <span className="hidden sm:inline">Dégâts</span>
            </TabsTrigger>
            <TabsTrigger value="restock-history" className="text-sm font-medium flex items-center gap-2 transition-all duration-200">
              <History size={16} />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200" size={18} />
                  <SimpleNumericInput
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    className="pl-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all duration-300 focus:scale-[1.02]"
                  />
                </div>
                
                {categories.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {inventoryStats.categoryOptions.map((category) => {
                      const categoryData = categories.find(cat => cat.name === category && !cat.isParent);
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="whitespace-nowrap flex-shrink-0 transition-all duration-300 hover:scale-105"
                          style={selectedCategory === category && categoryData ? {
                            backgroundColor: categoryData.color,
                            borderColor: categoryData.color
                          } : {}}
                        >
                          {category}
                          {category !== "Toutes" && (
                            <Badge variant="secondary" className="ml-2 text-xs animate-fade-in">
                              {inventory.filter(item => item.category === category).length}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <InventoryList />
          </TabsContent>

          <TabsContent value="categories">
            <HierarchicalCategoryView />
          </TabsContent>

          <TabsContent value="low-stock">
            <div className="space-y-4">
              {inventoryStats.lowStockItems.length === 0 ? (
                <EmptyState 
                  icon={TrendingDown}
                  title="Aucun article en faible stock"
                  description="Tous vos articles ont un stock suffisant selon leurs seuils définis"
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 animate-fade-in">
                    <TrendingDown className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">Articles en faible stock</h2>
                    <Badge variant="secondary">{inventoryStats.lowStockItems.length}</Badge>
                  </div>
                   <div className="space-y-3">
                     {inventoryStats.lowStockItems.map((item) => (
                       <div key={item.id} className="animate-fade-in">
                         <InventoryItem
                           id={item.id}
                           name={item.name}
                           category={item.category}
                           quantity={item.quantity}
                           unit={item.unit}
                           threshold={item.threshold}
                           purchasePrice={item.purchasePrice}
                           salePrice={item.salePrice}
                           containerType={item.containerType}
                           minQuantity={item.minQuantity}
                           categories={categories}
                         />
                       </div>
                     ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="out-stock">
            <div className="space-y-4">
              {inventoryStats.outOfStockItems.length === 0 ? (
                <EmptyState 
                  icon={AlertTriangle}
                  title="Aucun article épuisé"
                  description="Excellente nouvelle ! Aucun de vos articles n'est actuellement épuisé"
                />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 animate-fade-in">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h2 className="text-lg font-semibold">Articles épuisés</h2>
                    <Badge variant="destructive">{inventoryStats.outOfStockItems.length}</Badge>
                  </div>
                   <div className="space-y-3">
                     {inventoryStats.outOfStockItems.map((item) => (
                       <div key={item.id} className="animate-fade-in">
                         <InventoryItem
                           id={item.id}
                           name={item.name}
                           category={item.category}
                           quantity={item.quantity}
                           unit={item.unit}
                           threshold={item.threshold}
                           purchasePrice={item.purchasePrice}
                           salePrice={item.salePrice}
                           containerType={item.containerType}
                           minQuantity={item.minQuantity}
                           categories={categories}
                         />
                       </div>
                     ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="damage-reports">
            <div className="space-y-4">
              <DamageReportsHistory />
            </div>
          </TabsContent>

          <TabsContent value="restock-history">
            <OptimizedRestockHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Inventory = () => {
  const { getInventory, getCategories } = useLocalData();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        getInventory();
        getCategories();
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading inventory data:", error);
        setIsDataLoaded(true);
      }
    };
    
    loadData();
  }, [getInventory, getCategories]);

  const isSkeletonLoading = useSkeletonLoading(isDataLoaded);

  return (
    <PageWithSkeleton isLoading={isSkeletonLoading}>
      <InventoryContent />
    </PageWithSkeleton>
  );
};

export default Inventory;
