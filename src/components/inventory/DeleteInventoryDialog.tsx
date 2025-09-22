
import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLocalData } from "@/hooks/useLocalData";
import { useToast } from "@/hooks/use-toast";

interface DeleteInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  onSuccess?: () => void;
}

const DeleteInventoryDialog: React.FC<DeleteInventoryDialogProps> = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteInventoryItem } = useLocalData();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      deleteInventoryItem(itemId);
      toast({
        title: "🗑️ Article supprimé",
        description: `${itemName} a été supprimé de l'inventaire.`,
        variant: "destructive"
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Une erreur s'est produite lors de la suppression.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> de l'inventaire ? 
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInventoryDialog;
