
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalData } from '@/hooks/useLocalData';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Pencil, Trash2, Palette, Tag, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/lib/storage';

const colors = [
  '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', 
  '#f97316', '#06b6d4', '#ec4899', '#84cc16',
  '#3b82f6', '#6366f1', '#14b8a6', '#f59e0b'
];

// Fonction utilitaire pour émettre des événements personnalisés
const emitCategoryChange = () => {
  window.dispatchEvent(new CustomEvent('categoriesChanged'));
};

const CategoryManager = () => {
  const { getCategories, addCategory, updateCategory, deleteCategory, initializeParentCategories } = useLocalData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    color: colors[0],
    icon: 'package',
    parentId: 'none',
    isParent: false
  });
  const [autoAssignParent, setAutoAssignParent] = useState(true);

  const ensureParentCategories = () => {
    const categoriesData = getCategories();
    let hasChanges = false;
    
    // Ne pas recréer automatiquement les catégories si l'utilisateur les a supprimées
    // Vérifie si l'assignation automatique est activée avant de recréer
    if (autoAssignParent) {
      // Vérifier si "Sobebra" existe
      if (!categoriesData.find(cat => cat.name === 'Sobebra' && cat.isParent)) {
        const sobebraCategory = addCategory({
          name: 'Sobebra',
          color: '#10b981',
          icon: 'package',
          isParent: true
        });
        console.log('CategoryManager - Catégorie parente "Sobebra" créée:', sobebraCategory);
        hasChanges = true;
      }
      
      // Vérifier si "Cave à vins" existe
      if (!categoriesData.find(cat => cat.name === 'Cave à vins' && cat.isParent)) {
        const caveCategory = addCategory({
          name: 'Cave à vins',
          color: '#8b5cf6',
          icon: 'package',
          isParent: true
        });
        console.log('CategoryManager - Catégorie parente "Cave à vins" créée:', caveCategory);
        hasChanges = true;
      }
    }
    
    return hasChanges;
  };

  const loadCategories = () => {
    const categoriesData = getCategories();
    console.log('CategoryManager - Chargement des catégories:', categoriesData);
    setCategories(categoriesData);
    setParentCategories(categoriesData.filter(cat => cat.isParent));
  };

  useEffect(() => {
    initializeParentCategories();
    const hasNewParents = ensureParentCategories();
    loadCategories();
    
    if (open) {
      if (hasNewParents) {
        ensureParentCategories();
      }
      loadCategories();
    }
  }, [getCategories, initializeParentCategories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      let categoryData = {
        ...formData,
        parentId: formData.parentId === 'none' ? undefined : formData.parentId,
        isParent: formData.isParent || (formData.parentId === 'none' && !formData.isParent ? false : false)
      };

      // Attribution automatique des catégories parentes pour les sous-catégories (si activée)
      if (!formData.isParent && !editingCategory && autoAssignParent) {
        const allCategories = getCategories();
        const sobebraParent = allCategories.find(cat => cat.name === 'Sobebra' && cat.isParent);
        const caveParent = allCategories.find(cat => cat.name === 'Cave à vins' && cat.isParent);
        
        // Vérifier que les deux catégories parentes existent pour l'assignation automatique
        if (sobebraParent && caveParent) {
          if (formData.name === 'Vins et liqueurs') {
            categoryData.parentId = caveParent.id;
          } else {
            categoryData.parentId = sobebraParent.id;
          }
        } else {
          // Si au moins une catégorie parente manque, désactiver l'assignation automatique
          setAutoAssignParent(false);
          console.log('CategoryManager - Assignation automatique désactivée: catégories parentes manquantes');
        }
      }

      if (editingCategory) {
        const updatedCategory = updateCategory(editingCategory.id, categoryData);
        console.log('CategoryManager - Catégorie mise à jour:', updatedCategory);
        toast({
          title: "✅ Catégorie modifiée",
          description: `La catégorie "${formData.name}" a été mise à jour avec succès`
        });
      } else {
        const newCategory = addCategory(categoryData);
        console.log('CategoryManager - Nouvelle catégorie créée:', newCategory);
        toast({
          title: "🎉 Catégorie créée",
          description: `La catégorie "${formData.name}" a été ajoutée à votre inventaire`
        });
      }
      
      // Recharger immédiatement les catégories
      loadCategories();
      
      // Émettre un événement pour notifier les autres composants
      emitCategoryChange();
      
      // Reset du formulaire
      setFormData({ name: '', color: colors[0], icon: 'package', parentId: 'none', isParent: false });
      setEditingCategory(null);
    } catch (error) {
      console.error('CategoryManager - Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      parentId: category.parentId || 'none',
      isParent: category.isParent || false
    });
  };

  const handleDelete = (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(cat => cat.id === categoryId);
      deleteCategory(categoryId);
      console.log('CategoryManager - Catégorie supprimée:', categoryId);
      
      // Si une catégorie parente prédéfinie est supprimée, désactiver l'assignation automatique
      if (categoryToDelete && categoryToDelete.isParent && 
          (categoryToDelete.name === 'Sobebra' || categoryToDelete.name === 'Cave à vins')) {
        setAutoAssignParent(false);
        console.log('CategoryManager - Assignation automatique désactivée suite à la suppression de:', categoryToDelete.name);
      }
      
      // Recharger immédiatement les catégories
      loadCategories();
      
      // Émettre un événement pour notifier les autres composants
      emitCategoryChange();
      
      toast({
        title: "🗑️ Catégorie supprimée",
        description: `La catégorie "${categoryToDelete?.name || 'inconnue'}" a été supprimée définitivement`
      });
    } catch (error) {
      console.error('CategoryManager - Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette catégorie",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 hover:bg-background/80 transition-all duration-200">
          <Settings size={16} />
          <span className="hidden sm:inline">Catégories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5 text-primary" />
            Gestion des Catégories
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Organisez votre inventaire avec des catégories personnalisées
          </p>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Catégories existantes */}
          {categories.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {categories.length} catégorie{categories.length > 1 ? 's' : ''}
                </Badge>
                <Label className="text-sm font-medium">Catégories existantes</Label>
              </div>
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
                {categories.map(category => (
                  <Card key={category.id} className="group hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/20"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Tag size={32} className="text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Aucune catégorie</p>
                <p className="text-xs text-muted-foreground">
                  Créez votre première catégorie pour organiser votre inventaire
                </p>
              </CardContent>
            </Card>
          )}

          {/* Formulaire */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus size={16} className="text-primary" />
                  <Label className="text-sm font-semibold">
                    {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wide">
                    Nom
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Boissons, Snacks, Spiritueux..."
                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50"
                  />
                </div>
                
                 <div className="space-y-2">
                   <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                     Type de catégorie
                   </Label>
                   <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input
                         type="radio"
                         name="categoryType"
                         checked={formData.isParent}
                         onChange={() => setFormData({ ...formData, isParent: true, parentId: 'none' })}
                         className="text-primary"
                       />
                       <span className="text-sm">Catégorie parente</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                       <input
                         type="radio"
                         name="categoryType"
                         checked={!formData.isParent}
                         onChange={() => setFormData({ ...formData, isParent: false })}
                         className="text-primary"
                       />
                       <span className="text-sm">Sous-catégorie</span>
                     </label>
                   </div>
                 </div>

                 {!formData.isParent && (
                   <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Zap size={16} className="text-primary" />
                         <Label className="text-sm font-medium">Assignation automatique</Label>
                       </div>
                       <Switch
                         checked={autoAssignParent}
                         onCheckedChange={setAutoAssignParent}
                       />
                     </div>
                     {autoAssignParent && (
                       <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded border">
                         <p className="mb-1"><strong>"Vins et liqueurs"</strong> → Cave à vins</p>
                         <p><strong>Autres sous-catégories</strong> → Sobebra</p>
                       </div>
                     )}
                   </div>
                 )}

                 {!formData.isParent && !autoAssignParent && parentCategories.length > 0 && (
                   <div className="space-y-2">
                     <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                       Catégorie parente
                     </Label>
                     <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                       <SelectTrigger className="bg-background/50 border-muted-foreground/20 focus:border-primary/50">
                         <SelectValue placeholder="Sélectionner une catégorie parente" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">Aucune</SelectItem>
                         {parentCategories
                           .filter(parent => parent.id && parent.name && parent.isParent)
                           .map(parent => (
                           <SelectItem key={parent.id} value={parent.id}>
                             <div className="flex items-center gap-2">
                               <div 
                                 className="w-3 h-3 rounded-full"
                                 style={{ backgroundColor: parent.color }}
                               />
                               {parent.name}
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 )}

                 {!formData.isParent && !autoAssignParent && parentCategories.length === 0 && (
                   <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                     <p className="text-sm text-amber-800">
                       Créez d'abord une catégorie parente pour pouvoir ajouter des sous-catégories.
                     </p>
                   </div>
                 )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette size={14} className="text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Couleur
                    </Label>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                          formData.color === color 
                            ? 'border-foreground shadow-lg ring-2 ring-primary/20' 
                            : 'border-transparent hover:border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <Plus size={16} className="mr-2" />
                    {editingCategory ? 'Modifier' : 'Créer'}
                  </Button>
                  {editingCategory && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setFormData({ name: '', color: colors[0], icon: 'package', parentId: 'none', isParent: false });
                      }}
                      className="hover:bg-muted/50"
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
