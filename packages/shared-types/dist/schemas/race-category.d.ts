import { z } from 'zod';
export declare const RaceCategorySchema: z.ZodEnum<["marathon", "half_marathon", "ten_km", "kids_run"]>;
export type RaceCategory = z.infer<typeof RaceCategorySchema>;
//# sourceMappingURL=race-category.d.ts.map