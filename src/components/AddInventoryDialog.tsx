
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { AddInventoryForm } from "@/components/inventory/AddInventoryForm";

const AddInventoryDialog = () => {
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  if (!hasPermission('manage_inventory')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="h-9 gap-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
        >
          <Plus size={16} />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <Package size={20} className="text-primary" />
            </div>
            Ajouter un article
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel article à votre inventaire. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        
        <AddInventoryForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryDialog;
