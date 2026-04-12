import fs from "node:fs";
import path from "node:path";

import { deleteTestBranch } from "./neon-branch";

const BRANCH_STATE_FILE = path.join(__dirname, ".neon-branch-state.json");

export default async function globalTeardown() {
  // Clean up the .env.local override
  const envLocalPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envLocalPath)) {
    fs.unlinkSync(envLocalPath);
  }

  // Delete the temporary Neon branch
  if (!fs.existsSync(BRANCH_STATE_FILE)) {
    console.warn("No branch state file found — skipping branch cleanup.");
    return;
  }

  try {
    const { branchId } = JSON.parse(fs.readFileSync(BRANCH_STATE_FILE, "utf-8"));
    await deleteTestBranch(branchId);
  } catch (error) {
    console.error("Failed to delete test branch:", error);
  } finally {
    fs.unlinkSync(BRANCH_STATE_FILE);
  }
}
