import { useCallback } from 'react';
import { 
  validateData, 
  inventoryItemSchema, 
  saleSchema, 
  staffMemberSchema, 
  settingsSchema,
  addInventorySchema,
  addSaleSchema,
  addStaffSchema,
  type AddInventoryData,
  type AddSaleData,
  type AddStaffData
} from '@/lib/schemas';
import { toast } from '@/hooks/use-toast';

export const useDataValidation = () => {
  // Generic validation function with user feedback
  const validateWithFeedback = useCallback(<T>(
    schema: any,
    data: unknown,
    successMessage?: string
  ): { isValid: boolean; data?: T } => {
    const validation = validateData(schema, data);
    
    if (!validation.success) {
      const errors = 'errors' in validation ? validation.errors : ['Erreur de validation'];
      toast({
        title: "Données invalides",
        description: errors.join(', '),
        variant: "destructive"
      });
      return { isValid: false };
    }

    if (successMessage) {
      toast({
        title: "Validation réussie",
        description: successMessage,
        variant: "default"
      });
    }

    return { isValid: true, data: validation.data as T };
  }, []);

  // Specific validation functions
  const validateInventoryItem = useCallback((data: unknown) => {
    return validateWithFeedback<AddInventoryData>(
      addInventorySchema, 
      data, 
      "Article validé avec succès"
    );
  }, [validateWithFeedback]);

  const validateSale = useCallback((data: unknown) => {
    return validateWithFeedback<AddSaleData>(
      addSaleSchema, 
      data, 
      "Vente validée avec succès"
    );
  }, [validateWithFeedback]);

  const validateStaff = useCallback((data: unknown) => {
    return validateWithFeedback<AddStaffData>(
      addStaffSchema, 
      data, 
      "Personnel validé avec succès"
    );
  }, [validateWithFeedback]);

  // Silent validation (no toast feedback)
  const validateSilently = useCallback(<T>(schema: any, data: unknown) => {
    const validation = validateData(schema, data);
    return {
      isValid: validation.success,
      data: validation.success ? validation.data as T : undefined,
      errors: 'errors' in validation ? validation.errors : []
    };
  }, []);

  // Validation for existing data (cleanup/migration)
  const validateExistingData = useCallback(<T>(data: T[], schema: any): T[] => {
    const validItems: T[] = [];
    const invalidItems: unknown[] = [];

    data.forEach(item => {
      const validation = validateData(schema, item);
      if (validation.success) {
        validItems.push(validation.data as T);
      } else {
        invalidItems.push(item);
        console.warn('Invalid data item detected:', item);
      }
    });

    if (invalidItems.length > 0) {
      console.warn(`${invalidItems.length} invalid items found and filtered out`);
    }

    return validItems;
  }, []);

  return {
    validateInventoryItem,
    validateSale,
    validateStaff,
    validateWithFeedback,
    validateSilently,
    validateExistingData,
    
    // Direct schema access for form validation
    schemas: {
      inventory: addInventorySchema,
      sale: addSaleSchema,
      staff: addStaffSchema,
      settings: settingsSchema
    }
  };
};