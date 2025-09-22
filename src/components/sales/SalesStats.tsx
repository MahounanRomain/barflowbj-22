
import React from "react";
import { TrendingUp, PiggyBank } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SalesStatsProps {
  totalToday: number;
  totalItemsToday: number;
  totalProfits: number;
  formatFCFA: (amount: number) => string;
}

export const SalesStats: React.FC<SalesStatsProps> = ({
  totalToday,
  totalItemsToday,
  totalProfits,
  formatFCFA,
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">CA Aujourd'hui</span>
        </div>
        <span className="text-lg font-bold">{formatFCFA(totalToday)}</span>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-blue-500" />
          <span className="text-sm text-muted-foreground">Articles vendus</span>
        </div>
        <span className="text-lg font-bold">{totalItemsToday}</span>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <PiggyBank size={16} className="text-orange-500" />
          <span className="text-sm text-muted-foreground">Bénéfices</span>
        </div>
        <span className="text-lg font-bold text-green-600">{formatFCFA(totalProfits)}</span>
      </Card>
    </div>
  );
};
