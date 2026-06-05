"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.setGlobalPrefix('api');
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    app.get(nestjs_pino_1.Logger).log(`API listening on http://localhost:${port}/api`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map