import { z } from 'zod';

export const createPetSchema = z.object({
  name: z
    .string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be at most 50 characters')
    .trim(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'], {
    errorMap: () => ({ message: 'Invalid species' }),
  }),
  breed: z.string().max(100).optional().nullable(),
  birthDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional().nullable()),
  gender: z.enum(['male', 'female', 'unknown']).optional().nullable(),
  weight: z.number().positive('Weight must be positive').max(500).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  microchipNumber: z.string().max(50).optional().nullable(),
  customEmoji: z.string().max(4).optional().nullable(),
  finderNote: z.string().max(500).optional().nullable(),
  medicalInfo: z
    .object({
      allergies: z.array(z.string()).optional().nullable(),
      medications: z.array(z.string()).optional().nullable(),
      conditions: z.array(z.string()).optional().nullable(),
      bloodType: z.string().optional().nullable(),
      veterinarian: z.string().optional().nullable(),
      insuranceProvider: z.string().optional().nullable(),
      insuranceNumber: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  profilePhotoUrl: z.string().optional().nullable(),
  backgroundUrl: z.string().optional().nullable(),
  visibilitySettings: z
    .object({
      showName: z.boolean().optional(),
      showSpecies: z.boolean().optional(),
      showPhoto: z.boolean().optional(),
      showPhone: z.boolean().optional(),
      showEmail: z.boolean().optional(),
      showAddress: z.boolean().optional(),
      showMedicalInfo: z.boolean().optional(),
      showMicrochip: z.boolean().optional(),
      showFinderNote: z.boolean().optional(),
      showFoundButton: z.boolean().optional(),
    })
    .optional()
    .nullable(),
});

export const updatePetSchema = createPetSchema.partial();

export const updateVisibilitySchema = z.object({
  name: z.boolean().optional(),
  photo: z.boolean().optional(),
  species: z.boolean().optional(),
  breed: z.boolean().optional(),
  color: z.boolean().optional(),
  microchip: z.boolean().optional(),
  ownerPhone: z.boolean().optional(),
  ownerEmail: z.boolean().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['home', 'walking', 'lost'], {
    errorMap: () => ({ message: 'Status must be home, walking, or lost' }),
  }),
});

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type UpdateVisibilityInput = z.infer<typeof updateVisibilitySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
