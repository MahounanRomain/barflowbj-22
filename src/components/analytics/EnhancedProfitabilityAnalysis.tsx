import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  PieChart, 
  Target,
  AlertTriangle,
  Star,
  Award
} from "lucide-react";
import { useProfitabilityAnalysis } from "@/hooks/useProfitabilityAnalysis";
import { formatCurrency } from "@/lib/utils";

interface EnhancedProfitabilityAnalysisProps {
  dateRange?: { type: string; preset?: string; startDate?: string; endDate?: string };
}

const EnhancedProfitabilityAnalysis = ({ dateRange }: EnhancedProfitabilityAnalysisProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const { products, categories, summary } = useProfitabilityAnalysis(dateRange);

  const getMarginColor = (margin: number): string => {
    if (margin >= 50) return "text-success";
    if (margin >= 30) return "text-primary";
    if (margin >= 15) return "text-warning";
    return "text-destructive";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  return (
    <Card className="animate-fade-in hover-glow">
      <CardHeader className="animate-slide-in-left">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-success text-white animate-gentle-bounce">
            <PieChart size={20} />
          </div>
          <span className="text-shimmer">Analyse de Rentabilité Avancée</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vue d'ensemble des métriques globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" 
             style={{ '--stagger': 1 } as React.CSSProperties}>
          <Card className="p-4 hover-lift card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary animate-float" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-lg font-bold">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success animate-gentle-bounce" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bénéfice Total</p>
                <p className="text-lg font-bold text-success">{formatCurrency(summary.totalProfit)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="w-5 h-5 text-accent animate-float" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Marge Globale</p>
                <p className={`text-lg font-bold ${getMarginColor(summary.globalProfitMargin)}`}>
                  {summary.globalProfitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover-lift card-hover">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Package className="w-5 h-5 text-info animate-gentle-bounce" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{summary.totalTransactions}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Indicateurs de performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in-right"
             style={{ '--stagger': 2 } as React.CSSProperties}>
          {/* Top performer */}
          {summary.topProfitProduct && (
            <Card className="p-4 hover-glow">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-warning animate-float" />
                <h4 className="font-semibold">Produit le Plus Rentable</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{summary.topProfitProduct.itemName}</span>
                  <Badge variant="outline" className="animate-shimmer">
                    {formatCurrency(summary.topProfitProduct.totalProfit)}
                  </Badge>
                </div>
                <Progress 
                  value={summary.topProfitProduct.profitMargin} 
                  className="h-2 animate-progress-flow"
                />
                <p className="text-xs text-muted-foreground">
                  Marge: {summary.topProfitProduct.profitMargin.toFixed(1)}%
                </p>
              </div>
            </Card>
          )}

          {/* Best category */}
          {summary.bestPerformingCategory && (
            <Card className="p-4 hover-glow">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-5 h-5 text-primary animate-gentle-bounce" />
                <h4 className="font-semibold">Catégorie Leader</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{summary.bestPerformingCategory.category}</span>
                  <Badge variant="outline" className="animate-shimmer">
                    {formatCurrency(summary.bestPerformingCategory.totalProfit)}
                  </Badge>
                </div>
                <Progress 
                  value={summary.bestPerformingCategory.profitMargin} 
                  className="h-2 animate-progress-flow"
                />
                <p className="text-xs text-muted-foreground">
                  {summary.bestPerformingCategory.itemCount} produits - 
                  Marge: {summary.bestPerformingCategory.profitMargin.toFixed(1)}%
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Alerte sur performance */}
        {summary.worstPerformingCategory && summary.worstPerformingCategory.profitMargin < 10 && (
          <div className="p-4 border-l-4 border-destructive bg-destructive/5 rounded-r-lg animate-slide-in-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive animate-gentle-bounce" />
              <span className="font-medium text-destructive">Alerte Rentabilité</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              La catégorie "{summary.worstPerformingCategory.category}" a une marge très faible 
              ({summary.worstPerformingCategory.profitMargin.toFixed(1)}%). 
              Considérez revoir les prix ou optimiser les coûts.
            </p>
          </div>
        )}

        {/* Onglets détaillés */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="transition-smooth">
              Par Produit ({products.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="transition-smooth">
              Par Catégorie ({categories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4 animate-slide-in-left">
            {products.slice(0, 10).map((product, index) => (
              <Card key={product.itemName} className="p-4 hover-lift transition-smooth"
                    style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.itemName}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.totalProfit)}</p>
                    <p className={`text-sm ${getMarginColor(product.profitMargin)}`}>
                      {product.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>Quantité vendue</p>
                    <p className="font-medium text-foreground">{product.totalQuantity}</p>
                  </div>
                  <div>
                    <p>Prix moyen</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(product.averageSellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p>Bénéfice/unité</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(product.profitPerUnit)}
                    </p>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(100, product.profitMargin)} 
                  className="mt-3 h-2 animate-progress-flow" 
                />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 animate-slide-in-right">
            {categories.map((category, index) => (
              <Card key={category.category} className="p-4 hover-lift transition-smooth"
                    style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-medium">{category.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.itemCount} produit{category.itemCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(category.totalProfit)}</p>
                    <p className={`text-sm ${getMarginColor(category.profitMargin)}`}>
                      {category.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chiffre d'affaires</span>
                    <span className="font-medium">{formatCurrency(category.totalRevenue)}</span>
                  </div>
                  
                  <Progress 
                    value={Math.min(100, category.profitMargin)} 
                    className="h-2 animate-progress-flow"
                  />
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Résumé de tendance */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 animate-gradient-shift">
          <div className="flex items-center gap-3">
            {getTrendIcon(summary.profitabilityTrend)}
            <div>
              <h4 className="font-semibold">Tendance Globale</h4>
              <p className="text-sm text-muted-foreground">
                {summary.profitabilityTrend === 'positive' && "Votre rentabilité est en progression ! 📈"}
                {summary.profitabilityTrend === 'negative' && "Attention, la rentabilité baisse. Analysez vos coûts. 📉"}
                {summary.profitabilityTrend === 'neutral' && "Rentabilité stable. Opportunité d'optimisation ? ⚖️"}
              </p>
            </div>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfitabilityAnalysis;