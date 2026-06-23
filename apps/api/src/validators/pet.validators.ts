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
  breed: z.string().max(100).optional(),
  birthDate: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional()),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
  weight: z.number().positive('Weight must be positive').max(500).optional(),
  color: z.string().max(50).optional(),
  microchipNumber: z.string().max(50).optional(),
  customEmoji: z.string().max(4).optional(),
  finderNote: z.string().max(500).optional(),
  medicalInfo: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      bloodType: z.string().optional(),
      veterinarian: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insuranceNumber: z.string().optional(),
    })
    .optional(),
  profilePhotoUrl: z.string().url().optional(),
  backgroundUrl: z.string().url().optional(),
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
