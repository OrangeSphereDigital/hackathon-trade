import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

console.log("DATABASE_URL:", env("DATABASE_URL"));

export default defineConfig({
    schema: path.join("prisma", "schema"),
    migrations: {
        path: path.join("prisma", "migrations"),
        seed: "tsx prisma/seed.ts"
    },
    datasource: {
      url: env("DATABASE_URL")
    },
});
