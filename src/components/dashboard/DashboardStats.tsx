
import React from 'react';
import { TrendingUp, Package, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardStats = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const isMobile = useIsMobile();

  // Formatage en XOF
  const formatXOF = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statsConfig = [
    {
      title: "Chiffre d'Affaires",
      subtitle: "Aujourd'hui",
      value: formatXOF(stats.totalRevenue),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      path: "/sales"
    },
    {
      title: "Valeur Stock",
      subtitle: "Potentielle",
      value: formatXOF(stats.totalStockValue),
      icon: Package,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      path: "/inventory"
    },
    {
      title: "Personnel",
      subtitle: "Actif",
      value: stats.activeStaff.toString(),
      icon: Users,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      path: "/staff"
    },
    {
      title: "Alertes",
      subtitle: "Stock bas",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      gradient: stats.lowStockItems > 0 ? "from-red-500 to-orange-600" : "from-green-500 to-emerald-600",
      bgGradient: stats.lowStockItems > 0 
        ? "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20"
        : "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      iconBg: stats.lowStockItems > 0 
        ? "bg-red-100 dark:bg-red-900/30" 
        : "bg-green-100 dark:bg-green-900/30",
      iconColor: stats.lowStockItems > 0 
        ? "text-red-600 dark:text-red-400" 
        : "text-green-600 dark:text-green-400",
      path: "/inventory"
    }
  ];

  return (
    <>
      {statsConfig.map((stat) => (
        <Card 
          key={stat.title} 
          className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${!isMobile ? 'card-hover' : ''}`}
          onClick={() => navigate(stat.path)}
        >
          <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-start flex-col gap-1">
                  <h3 className={`font-semibold text-foreground/90 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                    {stat.title}
                  </h3>
                  <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full whitespace-nowrap`}>
                    {stat.subtitle}
                  </span>
                </div>
                <p className={`font-bold text-foreground group-hover:scale-105 transition-transform duration-300 ${isMobile ? 'text-lg leading-tight' : 'text-3xl'} truncate`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.iconBg} ${isMobile ? 'p-2.5' : 'p-4'} rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0 ml-2`}>
                <stat.icon className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} ${stat.iconColor}`} />
              </div>
            </div>
          </div>
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        </Card>
      ))}
    </>
  );
};

export default DashboardStats;
