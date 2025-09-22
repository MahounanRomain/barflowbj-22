
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocalData } from "@/hooks/useLocalData";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";

const inventorySchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du produit doit comporter au moins 2 caractères.",
  }),
  parentCategory: z.string().min(1, {
    message: "Veuillez sélectionner une catégorie parente.",
  }),
  category: z.string().min(1, {
    message: "Veuillez sélectionner une catégorie.",
  }),
  quantity: z.number().min(0, {
    message: "La quantité ne peut pas être négative.",
  }),
  threshold: z.number().min(0, {
    message: "Le seuil d'alerte ne peut pas être négatif.",
  }),
  purchasePrice: z.number().min(0, {
    message: "Le prix d'achat ne peut pas être négatif.",
  }),
  salePrice: z.number().min(0.01, {
    message: "Le prix de vente doit être supérieur à 0.",
  }),
  containerType: z.string().min(1, {
    message: "Veuillez sélectionner un type de contenant.",
  }),
});

interface AddInventoryFormProps {
  onSuccess: () => void;
}

export const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onSuccess }) => {
  const { addInventoryItem, getCategories, getInventory } = useLocalData();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      parentCategory: "",
      category: "",
      quantity: 0,
      threshold: 5,
      purchasePrice: 0,
      salePrice: 0,
      containerType: "",
    }
  });

  const [allCategories, setAllCategories] = useState(() => getCategories());
  const [parentCategories, setParentCategories] = useState(() => getCategories().filter(cat => cat.isParent));
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  // Fonction pour recharger les catégories
  const loadCategories = () => {
    const categoriesData = getCategories();
    console.log('AddInventoryForm - Rechargement des catégories:', categoriesData);
    setAllCategories(categoriesData);
    setParentCategories(categoriesData.filter(cat => cat.isParent));
  };

  // Écouter les changements de catégories
  useEffect(() => {
    const handleCategoryChange = () => {
      console.log('AddInventoryForm - Événement categoriesChanged reçu');
      loadCategories();
    };

    // Charger les catégories au montage
    loadCategories();

    // Écouter les événements de changement
    window.addEventListener('categoriesChanged', handleCategoryChange);

    return () => {
      window.removeEventListener('categoriesChanged', handleCategoryChange);
    };
  }, []);

  // Update available categories when parent category changes
  useEffect(() => {
    const parentCategoryId = form.watch('parentCategory');
    if (parentCategoryId) {
      const children = allCategories.filter(cat => cat.parentId === parentCategoryId);
      setAvailableCategories(children);
      // Reset category selection when parent changes
      form.setValue('category', '');
    } else {
      setAvailableCategories([]);
    }
  }, [form.watch('parentCategory'), allCategories]);

  const checkForDuplicates = (name: string, category: string): boolean => {
    const inventory = getInventory();
    return inventory.some(item => 
      item.name.toLowerCase().trim() === name.toLowerCase().trim() && 
      item.category === category
    );
  };

  const onSubmit = (values: z.infer<typeof inventorySchema>) => {
    if (checkForDuplicates(values.name, values.category)) {
      toast({
        title: "Produit déjà existant",
        description: `Un article "${values.name}" existe déjà dans la catégorie "${values.category}".`,
        variant: "destructive",
      });
      return;
    }

    try {
      const newItem = addInventoryItem({
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        stock: values.quantity,
        threshold: values.threshold,
        purchasePrice: values.purchasePrice,
        salePrice: values.salePrice,
        containerType: values.containerType,
        unit: values.containerType.toLowerCase().includes('bouteille') ? 'bouteilles' : 'unités',
        minQuantity: Math.max(1, Math.floor(values.threshold * 0.5))
      });

      console.log("AddInventoryForm - Nouvel article ajouté:", newItem);
      
      toast({
        title: "Article ajouté",
        description: `${values.name} a été ajouté à l'inventaire.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("AddInventoryForm - Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Whisky Jack Daniel's" 
                  {...field} 
                  className="focus:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie parente *</FormLabel>
              {parentCategories.length === 0 ? (
                <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
                  <CardContent className="p-4 text-center">
                    <Tag size={24} className="text-muted-foreground mb-2 mx-auto" />
                    <CardDescription className="text-sm">
                      Aucune catégorie parente disponible. Créez d'abord une catégorie parente via le bouton "Catégories" en haut de l'écran.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie parente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentCategories.filter(category => category.id && category.name).map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie *</FormLabel>
              {!form.watch('parentCategory') ? (
                <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
                  <CardContent className="p-4 text-center">
                    <Tag size={24} className="text-muted-foreground mb-2 mx-auto" />
                    <CardDescription className="text-sm">
                      Sélectionnez d'abord une catégorie parente.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : availableCategories.length === 0 ? (
                <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/10">
                  <CardContent className="p-4 text-center">
                    <Tag size={24} className="text-muted-foreground mb-2 mx-auto" />
                    <CardDescription className="text-sm">
                      Aucune sous-catégorie disponible pour cette catégorie parente. Créez-en une via le bouton "Catégories".
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories.filter(category => category.id && category.name).map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="containerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de contenant *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bouteille">Bouteille</SelectItem>
                  <SelectItem value="canette">Canette</SelectItem>
                  <SelectItem value="fût">Fût</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="sac">Sac</SelectItem>
                  <SelectItem value="boîte">Boîte</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité initiale *</FormLabel>
              <FormControl>
                <NumericInput 
                  placeholder="Quantité en stock" 
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Nombre d'unités actuellement en stock
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seuil d'alerte</FormLabel>
              <FormControl>
                <NumericInput 
                  placeholder="Seuil d'alerte de stock" 
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Quantité minimale avant alerte de stock faible
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix d'achat</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumericInput 
                      placeholder="Prix d'achat" 
                      value={field.value}
                      onChange={field.onChange}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      FCFA
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix de vente *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <NumericInput 
                      placeholder="Prix de vente" 
                      value={field.value}
                      onChange={field.onChange}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      FCFA
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button 
            type="submit" 
            className="min-w-[100px]"
            disabled={parentCategories.length === 0}
          >
            <Plus size={16} className="mr-2" />
            Ajouter
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
