import { z } from 'zod';

export const RaceCategorySchema = z.enum(['marathon', 'half_marathon', 'ten_km', 'kids_run']);

export type RaceCategory = z.infer<typeof RaceCategorySchema>;
