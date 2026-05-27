import { describe, expect, it } from 'vitest';

import { RaceCategorySchema } from './race-category';

describe('RaceCategorySchema', () => {
  it('accepts valid categories', () => {
    expect(RaceCategorySchema.parse('marathon')).toBe('marathon');
    expect(RaceCategorySchema.parse('half_marathon')).toBe('half_marathon');
    expect(RaceCategorySchema.parse('ten_km')).toBe('ten_km');
    expect(RaceCategorySchema.parse('kids_run')).toBe('kids_run');
  });

  it('rejects unknown categories', () => {
    expect(() => RaceCategorySchema.parse('ultra_marathon')).toThrow();
    expect(() => RaceCategorySchema.parse('')).toThrow();
    expect(() => RaceCategorySchema.parse(null)).toThrow();
  });
});
