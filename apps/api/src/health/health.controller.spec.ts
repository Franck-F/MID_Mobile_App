import { Test } from '@nestjs/testing';
import { describe, expect, it, beforeAll } from 'vitest';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('liveness returns ok with version and uptime', () => {
    const result = controller.liveness();
    expect(result.status).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThan(0);
    expect(typeof result.version).toBe('string');
  });

  it('readiness returns ok shape (deps health checked elsewhere)', async () => {
    const result = await controller.readiness();
    expect(['ok', 'degraded']).toContain(result.status);
    expect(result.checks).toBeDefined();
  });
});
