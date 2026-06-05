"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const env_schema_1 = require("./env.schema");
function validateEnv(raw) {
    const result = env_schema_1.envSchema.safeParse(raw);
    if (!result.success) {
        const formatted = result.error.format();
        console.error('❌ Invalid environment variables:', JSON.stringify(formatted, null, 2));
        throw new Error('Invalid environment variables — see logs above');
    }
    return result.data;
}
//# sourceMappingURL=env.validation.js.map