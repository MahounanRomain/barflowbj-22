
import React, { useState, useEffect } from "react";
import { Wallet, Plus, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CashManager: React.FC = () => {
  const { getCashBalance, setCashBalance, getCashTransactions } = useLocalData();
  const { toast } = useToast();
  const [initialAmount, setInitialAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cashBalance, setCashBalanceState] = useState(getCashBalance());
  const [transactions, setTransactions] = useState(getCashTransactions());

  useEffect(() => {
    const loadData = () => {
      setCashBalanceState(getCashBalance());
      setTransactions(getCashTransactions());
    };
    
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [getCashBalance, getCashTransactions]);

  const handleSetInitialCash = () => {
    const amount = parseFloat(initialAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant valide",
        variant: "destructive"
      });
      return;
    }

    setCashBalance(amount);
    setCashBalanceState(getCashBalance());
    setIsDialogOpen(false);
    setInitialAmount("");
    
    toast({
      title: "💰 Caisse initialisée",
      description: `Montant initial défini : ${formatFCFA(amount)}`,
    });
  };

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (!cashBalance) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-amber-900 dark:text-amber-100">Gestion de la caisse</CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Initialisez votre caisse pour commencer le suivi
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              Définissez le montant initial de votre caisse
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Ce montant sera automatiquement mis à jour à chaque vente
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white">
                <Plus size={16} className="mr-2" />
                Initialiser la caisse
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background dark:bg-background">
              <DialogHeader>
                <DialogTitle className="text-foreground">Initialiser la caisse</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Définissez le montant initial de votre caisse
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="initial-amount" className="text-foreground">Montant initial (FCFA)</Label>
                  <Input
                    id="initial-amount"
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    placeholder="Ex: 50000"
                    className="mt-1 bg-background text-foreground border-border"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSetInitialCash}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                  >
                    Confirmer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-900 dark:text-green-100">Caisse actuelle</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-300">
                  Montant en espèces disponible
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-lg px-3 py-1">
              {formatFCFA(cashBalance.currentAmount)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white dark:bg-background/50 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">Initial</p>
              <p className="font-semibold text-green-800 dark:text-green-200">{formatFCFA(cashBalance.initialAmount)}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-background/50 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Entrées</p>
              </div>
              <p className="font-semibold text-green-600 dark:text-green-400">+{formatFCFA(totalIncome)}</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-background/50 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Sorties</p>
              </div>
              <p className="font-semibold text-red-600 dark:text-red-400">-{formatFCFA(totalExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-background">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  Réinitialiser
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background dark:bg-background">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Réinitialiser la caisse</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Définir un nouveau montant initial (effacera l'historique)
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reset-amount" className="text-foreground">Nouveau montant (FCFA)</Label>
                    <Input
                      id="reset-amount"
                      type="number"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      placeholder="Ex: 50000"
                      className="mt-1 bg-background text-foreground border-border"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSetInitialCash}
                      className="flex-1"
                      variant="destructive"
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
