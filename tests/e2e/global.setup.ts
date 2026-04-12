import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { createTestBranch } from "./neon-branch";

const BRANCH_STATE_FILE = path.join(__dirname, ".neon-branch-state.json");

export default async function globalSetup() {
  process.env.PLAYWRIGHT_BASE_URL ??= "http://127.0.0.1:3000";
  process.env.NEXT_PUBLIC_APP_URL ??= process.env.PLAYWRIGHT_BASE_URL;

  // Create a temporary Neon branch for this test run
  const branch = await createTestBranch();

  // Persist branch ID so globalTeardown can clean it up
  fs.writeFileSync(BRANCH_STATE_FILE, JSON.stringify({ branchId: branch.branchId }));

  // Point the app and migrations at the test branch
  process.env.DATABASE_URL = branch.databaseUrl;

  console.log("Running migrations on test branch...");
  execSync("bun run db:migrate -- --force", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: branch.databaseUrl },
  });

  console.log("Seeding test branch...");
  execSync("bun run db:seed", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: branch.databaseUrl },
  });

  // Write a temporary .env.local so the Next.js dev server picks up
  // the branch DATABASE_URL when Playwright starts it.
  // (.env.local overrides .env in Next.js)
  const envLocalPath = path.join(__dirname, "../../.env.local");
  fs.writeFileSync(
    envLocalPath,
    `DATABASE_URL="${branch.databaseUrl}"\n`,
  );
}
