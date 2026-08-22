"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
const node_process_1 = __importDefault(require("node:process"));
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: node_process_1.default.env.DATABASE_URL ??
            "postgres://postgres:postgres@localhost:5432/unisole",
    },
});
//# sourceMappingURL=drizzle.config.js.map