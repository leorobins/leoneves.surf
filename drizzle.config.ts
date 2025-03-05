import { defineConfig } from "drizzle-kit";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SQLite configuration
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: resolve(__dirname, "sqlite.db"),
  },
});
