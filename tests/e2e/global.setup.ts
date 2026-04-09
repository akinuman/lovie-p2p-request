import { execSync } from "node:child_process";

export default async function globalSetup() {
  execSync("bun run prisma:generate", { stdio: "inherit" });
  execSync("bun run prisma:seed", { stdio: "inherit" });
}
