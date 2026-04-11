import { execSync } from "node:child_process";

export default async function globalSetup() {
  process.env.PLAYWRIGHT_BASE_URL ??= "http://127.0.0.1:3000";
  process.env.NEXT_PUBLIC_APP_URL ??= process.env.PLAYWRIGHT_BASE_URL;

  execSync("bun run db:migrate -- --force", { stdio: "inherit" });
  execSync("bun run db:seed", { stdio: "inherit" });
}
