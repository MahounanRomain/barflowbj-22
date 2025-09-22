
import React, { useState, useEffect } from "react";
import { Minus, Plus, Calendar, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const EXPENSE_CATEGORIES = [
  { id: 'supplies', name: 'Fournitures', color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' },
  { id: 'maintenance', name: 'Maintenance', color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200' },
  { id: 'staff', name: 'Personnel', color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' },
  { id: 'utilities', name: 'Factures', color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200' },
  { id: 'marketing', name: 'Marketing', color: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200' },
  { id: 'other', name: 'Autres', color: 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200' },
];

export const SpendsManager: React.FC = () => {
  const { getCashTransactions, addCashTransaction, deleteCashTransaction, getCashBalance } = useLocalData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState(getCashTransactions());
  const [cashBalance, setCashBalance] = useState(getCashBalance());

  useEffect(() => {
    const loadData = () => {
      setTransactions(getCashTransactions());
      setCashBalance(getCashBalance());
    };
    
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [getCashTransactions, getCashBalance]);

  const handleAddExpense = () => {
    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez saisir un montant valide",
        variant: "destructive"
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description manquante",
        description: "Veuillez saisir une description",
        variant: "destructive"
      });
      return;
    }

    if (!category) {
      toast({
        title: "Catégorie manquante",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive"
      });
      return;
    }

    if (cashBalance && expenseAmount > cashBalance.currentAmount) {
      toast({
        title: "Solde insuffisant",
        description: "Le montant de la dépense dépasse le solde actuel de la caisse",
        variant: "destructive"
      });
      return;
    }

    try {
      addCashTransaction({
        type: 'expense',
        amount: expenseAmount,
        description: description.trim(),
        category
      });

      toast({
        title: "💸 Dépense enregistrée",
        description: `${description} - ${formatFCFA(expenseAmount)}`,
      });

      setIsDialogOpen(false);
      setAmount("");
      setDescription("");
      setCategory("");
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setTransactions(getCashTransactions());
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la dépense",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = (id: string) => {
    try {
      deleteCashTransaction(id);
      setTransactions(getCashTransactions());
      toast({
        title: "Dépense supprimée",
        description: "La dépense a été supprimée et le montant restauré à la caisse",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la dépense",
        variant: "destructive"
      });
    }
  };

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const getCategoryInfo = (categoryId: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <Minus className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">Dépenses</CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Gestion des sorties de caisse
                </CardDescription>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  <Plus size={16} className="mr-2" />
                  Nouvelle dépense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une dépense</DialogTitle>
                  <DialogDescription>
                    Enregistrer une nouvelle sortie de caisse
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="expense-amount">Montant (FCFA) *</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Ex: 5000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expense-description">Description *</Label>
                    <Input
                      id="expense-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Achat de produits d'entretien"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Catégorie *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="expense-date">Date de la dépense *</Label>
                    <Input
                      id="expense-date"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>

                  {cashBalance && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Solde actuel de la caisse : <strong>{formatFCFA(cashBalance.currentAmount)}</strong>
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleAddExpense}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-700">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total des dépenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatFCFA(totalExpenses)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{expenses.length} dépenses enregistrées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {expenses.length > 0 ? (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Historique des dépenses</CardTitle>
            <CardDescription>
              Les {expenses.length} dernières dépenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 20)
                .map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  
                  return (
                    <div key={expense.id} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                          <Minus className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium dark:text-gray-100">{expense.description}</h4>
                            <Badge className={categoryInfo.color}>
                              {categoryInfo.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(expense.timestamp), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          -{formatFCFA(expense.amount)}
                        </span>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action va supprimer la dépense "{expense.description}" et restaurer {formatFCFA(expense.amount)} à la caisse. Cette action ne peut pas être annulée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Minus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Aucune dépense enregistrée</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Utilisez le bouton "Nouvelle dépense" pour commencer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
