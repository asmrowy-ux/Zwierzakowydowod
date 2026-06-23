import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z.string().max(2000).optional(),
  eventType: z.enum(
    ['vet_visit', 'vaccination', 'medication', 'grooming', 'walk', 'feeding', 'training', 'checkup', 'surgery', 'other'],
    { errorMap: () => ({ message: 'Invalid event type' }) }
  ),
  eventDate: z.string().datetime({ message: 'Invalid date format. Use ISO 8601.' }),
  recurrence: z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly']).default('none'),
  reminderEnabled: z.boolean().default(false),
  reminderMinutesBefore: z.number().int().min(0).max(10080).default(30), // max 7 days
  clinicName: z.string().max(200).optional(),
  vetName: z.string().max(200).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
