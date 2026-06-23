import { z } from 'zod';

export const createFoundReportSchema = z.object({
  finderName: z.string().max(100).optional(),
  finderPhone: z.string().max(30).optional(),
  finderEmail: z.string().email('Invalid email').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  message: z.string().max(1000).optional(),
});

export type CreateFoundReportInput = z.infer<typeof createFoundReportSchema>;
