import { z } from 'zod';

export const createFoundReportSchema = z.object({
  finderName: z.string().max(100).optional().nullable(),
  finderPhone: z.string().max(30).optional().nullable(),
  finderEmail: z.string().email('Invalid email').optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
});

export type CreateFoundReportInput = z.infer<typeof createFoundReportSchema>;

