
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Table as TableIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
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

interface Table {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: string;
}

const TableManager = () => {
  const { getTables, saveTables } = useLocalData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4
  });

  const tables = getTables();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la table est requis",
        variant: "destructive"
      });
      return;
    }

    const tableData = {
      id: editingTable?.id || Math.random().toString(36).substring(2, 9),
      name: formData.name.trim(),
      capacity: formData.capacity,
      isActive: true,
      createdAt: editingTable?.createdAt || new Date().toISOString()
    };

    let updatedTables;
    if (editingTable) {
      updatedTables = tables.map(table => 
        table.id === editingTable.id ? tableData : table
      );
      toast({
        title: "Table modifiée",
        description: `Table ${tableData.name} mise à jour avec succès`
      });
    } else {
      updatedTables = [...tables, tableData];
      toast({
        title: "Table créée",
        description: `Table ${tableData.name} créée avec succès`
      });
    }

    saveTables(updatedTables);
    
    setFormData({ name: '', capacity: 4 });
    setEditingTable(null);
    setOpen(false);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity
    });
    setOpen(true);
  };

  const handleDelete = (tableId: string) => {
    const updatedTables = tables.filter(table => table.id !== tableId);
    saveTables(updatedTables);
    
    toast({
      title: "Table supprimée",
      description: "La table a été supprimée avec succès"
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingTable(null);
      setFormData({ name: '', capacity: 4 });
    }
    setOpen(newOpen);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gestion des Tables</h3>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-1" />
              Ajouter Table
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {editingTable ? 'Modifier la Table' : 'Nouvelle Table'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la table *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Table 1, Terrasse A..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="capacity">Capacité (nombre de places)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                />
              </div>
              
              <Button type="submit" className="w-full">
                {editingTable ? 'Modifier' : 'Créer la table'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tables.length === 0 ? (
          <Card className="p-6 col-span-full">
            <div className="text-center text-muted-foreground">
              <TableIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>Aucune table créée. Commencez par ajouter votre première table !</p>
            </div>
          </Card>
        ) : (
          tables.map((table) => (
            <Card key={table.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{table.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Capacité: {table.capacity} places
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(table)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette table ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement la table "{table.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(table.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TableManager;
