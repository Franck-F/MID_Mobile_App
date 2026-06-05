"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPinoConfig = buildPinoConfig;
function buildPinoConfig(config) {
    const isProduction = config.get('NODE_ENV', { infer: true }) === 'production';
    const level = config.get('LOG_LEVEL', { infer: true });
    return {
        pinoHttp: {
            level,
            transport: isProduction
                ? undefined
                : {
                    target: 'pino-pretty',
                    options: { singleLine: true, colorize: true, translateTime: 'HH:MM:ss.l' },
                },
            autoLogging: { ignore: (req) => req.url === '/api/healthz' || req.url === '/api/readyz' },
            redact: {
                paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
                censor: '[REDACTED]',
            },
            serializers: {
                req: (req) => ({
                    method: req.method,
                    url: req.url,
                    id: req.id,
                }),
                res: (res) => ({ statusCode: res.statusCode }),
            },
        },
    };
}
//# sourceMappingURL=pino.config.js.map