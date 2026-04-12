/**
 * Neon branch helpers for E2E test isolation.
 *
 * Creates a temporary Neon branch from the production branch before tests,
 * runs migrations + seed against it, and deletes it after tests finish.
 */

const NEON_API_BASE = "https://console.neon.tech/api/v2";

interface NeonBranchInfo {
  branchId: string;
  host: string;
  databaseUrl: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required for E2E tests. Add it to your .env file.`,
    );
  }
  return value;
}

async function neonFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const apiKey = getRequiredEnv("NEON_API_KEY");
  const response = await fetch(`${NEON_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Neon API ${response.status}: ${body}`);
  }

  return response;
}

export async function createTestBranch(): Promise<NeonBranchInfo> {
  const projectId = getRequiredEnv("NEON_PROJECT_ID");
  const branchName = `e2e-test-${Date.now()}`;

  console.log(`Creating Neon branch "${branchName}"...`);

  const createResponse = await neonFetch(
    `/projects/${projectId}/branches`,
    {
      method: "POST",
      body: JSON.stringify({
        branch: {
          name: branchName,
        },
        endpoints: [
          {
            type: "read_write",
          },
        ],
      }),
    },
  );

  const data = await createResponse.json();
  const branchId: string = data.branch.id;
  const host: string = data.endpoints[0].host;

  // Build the connection URI from the branch endpoint host,
  // reusing credentials from the existing DATABASE_URL.
  const mainUrl = getRequiredEnv("DATABASE_URL");
  const parsed = new URL(mainUrl);
  const user = parsed.username;
  const password = parsed.password;
  const dbName = parsed.pathname.replace("/", "");

  const databaseUrl = `postgresql://${user}:${password}@${host}/${dbName}?sslmode=require`;

  console.log(`Branch "${branchName}" created (${branchId})`);
  console.log(`Host: ${host}`);

  return { branchId, host, databaseUrl };
}

export async function deleteTestBranch(branchId: string): Promise<void> {
  const projectId = getRequiredEnv("NEON_PROJECT_ID");

  console.log(`Deleting Neon branch ${branchId}...`);

  await neonFetch(`/projects/${projectId}/branches/${branchId}`, {
    method: "DELETE",
  });

  console.log(`Branch ${branchId} deleted.`);
}
