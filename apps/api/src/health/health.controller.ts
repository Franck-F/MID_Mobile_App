import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

interface Liveness {
  status: 'ok';
  uptime: number;
  version: string;
  timestamp: string;
}

interface ReadinessCheck {
  postgres: 'up' | 'down' | 'unknown';
  redis: 'up' | 'down' | 'unknown';
}

interface Readiness {
  status: 'ok' | 'degraded';
  checks: ReadinessCheck;
  timestamp: string;
}

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('healthz')
  liveness(): Liveness {
    return {
      status: 'ok',
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readyz')
  readiness(): Promise<Readiness> {
    return Promise.resolve({
      status: 'ok',
      checks: { postgres: 'unknown', redis: 'unknown' },
      timestamp: new Date().toISOString(),
    });
  }
}
