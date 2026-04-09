import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("bun run db:migrate", { stdio: "inherit" });
  execSync("bun run db:seed", { stdio: "inherit" });
}
