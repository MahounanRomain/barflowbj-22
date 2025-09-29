import { z } from 'zod';

// Base schemas
const dateSchema = z.union([z.string(), z.date()]).transform((val) => 
  typeof val === 'string' ? new Date(val) : val
);

const positiveNumberSchema = z.number().min(0, "La valeur doit être positive");
const requiredStringSchema = z.string().trim().min(1, "Ce champ est requis");

// Inventory schemas
export const inventoryItemSchema = z.object({
  id: z.string(),
  name: requiredStringSchema.max(100, "Le nom ne peut pas dépasser 100 caractères"),
  category: requiredStringSchema.max(50, "La catégorie ne peut pas dépasser 50 caractères"),
  quantity: z.number().int().min(0, "La quantité doit être un nombre entier positif"),
  price: positiveNumberSchema,
  cost: positiveNumberSchema.optional(),
  minThreshold: z.number().int().min(0, "Le seuil minimum doit être positif").optional(),
  lastRestocked: dateSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const addInventorySchema = inventoryItemSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Sales schemas
export const saleItemSchema = z.object({
  inventoryId: z.string(),
  name: requiredStringSchema,
  quantity: z.number().int().min(1, "La quantité doit être d'au moins 1"),
  price: positiveNumberSchema,
  total: positiveNumberSchema,
});

export const saleSchema = z.object({
  id: z.string(),
  items: z.array(saleItemSchema).min(1, "Au moins un article est requis"),
  total: positiveNumberSchema,
  tableNumber: z.number().int().min(1).optional(),
  staffMember: requiredStringSchema.max(50, "Le nom du personnel ne peut pas dépasser 50 caractères").optional(),
  paymentMethod: z.enum(['cash', 'card', 'mobile'], {
    errorMap: () => ({ message: "Méthode de paiement invalide" })
  }).optional(),
  createdAt: dateSchema,
});

export const addSaleSchema = saleSchema.omit({ 
  id: true, 
  createdAt: true 
});

// Staff schemas
export const staffMemberSchema = z.object({
  id: z.string(),
  name: requiredStringSchema.max(50, "Le nom ne peut pas dépasser 50 caractères"),
  role: requiredStringSchema.max(30, "Le rôle ne peut pas dépasser 30 caractères"),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const addStaffSchema = staffMemberSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Settings schemas
export const settingsSchema = z.object({
  establishmentName: requiredStringSchema.max(100, "Le nom de l'établissement ne peut pas dépasser 100 caractères"),
  currency: z.string().length(3, "La devise doit faire 3 caractères").default('EUR'),
  taxRate: z.number().min(0).max(100, "Le taux de taxe doit être entre 0 et 100%").default(20),
  darkMode: z.boolean().default(false),
  notifications: z.object({
    lowStock: z.boolean().default(true),
    dailyReports: z.boolean().default(true),
    sales: z.boolean().default(false),
  }).default({}),
  autoBackup: z.boolean().default(true),
  language: z.enum(['fr', 'en']).default('fr'),
});

// Cash flow schemas
export const cashTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: "Type de transaction invalide" })
  }),
  amount: positiveNumberSchema,
  description: requiredStringSchema.max(200, "La description ne peut pas dépasser 200 caractères"),
  category: requiredStringSchema.max(50, "La catégorie ne peut pas dépasser 50 caractères"),
  createdAt: dateSchema,
});

export const addCashTransactionSchema = cashTransactionSchema.omit({ 
  id: true, 
  createdAt: true 
});

// Table schemas
export const tableSchema = z.object({
  id: z.number().int().min(1, "Le numéro de table doit être positif"),
  name: requiredStringSchema.max(20, "Le nom de la table ne peut pas dépasser 20 caractères"),
  capacity: z.number().int().min(1, "La capacité doit être d'au moins 1"),
  isOccupied: z.boolean().default(false),
  currentBill: positiveNumberSchema.default(0),
  occupiedSince: dateSchema.optional(),
});

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T 
} | { 
  success: false; 
  errors: string[] 
} => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => err.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Erreur de validation inconnue'] 
    };
  }
};

export const validateDataAsync = async <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> => {
  try {
    const validData = await schema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => err.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Erreur de validation inconnue'] 
    };
  }
};

// Type exports
export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type AddInventoryData = z.infer<typeof addInventorySchema>;
export type Sale = z.infer<typeof saleSchema>;
export type AddSaleData = z.infer<typeof addSaleSchema>;
export type StaffMember = z.infer<typeof staffMemberSchema>;
export type AddStaffData = z.infer<typeof addStaffSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type CashTransaction = z.infer<typeof cashTransactionSchema>;
export type AddCashTransactionData = z.infer<typeof addCashTransactionSchema>;
export type Table = z.infer<typeof tableSchema>;