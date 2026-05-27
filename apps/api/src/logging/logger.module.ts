import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as NestPinoLoggerModule } from 'nestjs-pino';

import type { Env } from '../config/env.schema';

import { buildPinoConfig } from './pino.config';

@Module({
  imports: [
    NestPinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => buildPinoConfig(config),
    }),
  ],
})
export class LoggerModule {}
