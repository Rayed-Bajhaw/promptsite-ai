import fetch from "node-fetch";

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const token = process.env.GITHUB_TOKEN!;

if (!owner || !repo || !token) {
  throw new Error(
    "Missing required environment variables: GITHUB_REPO_OWNER, GITHUB_REPO_NAME, or GITHUB_TOKEN"
  );
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

export async function createBranch(branchName: string) {
  const mainRef = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
    { headers }
  );

  if (!mainRef.ok) {
    const error = await mainRef.text();
    throw new Error(`Failed to fetch main branch: ${mainRef.status} ${error}`);
  }

  const mainData = await mainRef.json();

  if (!mainData?.object?.sha) {
    throw new Error("Invalid response structure from GitHub API");
  }

  const createRef = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: mainData.object.sha,
      }),
    }
  );
  if (!createRef.ok) {
    const error = await createRef.text();
    throw new Error(`Failed to create branch: ${createRef.status} ${error}`);
  }
  return createRef;
}

export async function uploadFile(
  branchName: string,
  path: string,
  content: string
) {
  const encoded = Buffer.from(content).toString("base64");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Add generated site file: ${path}`,
        content: encoded,
        branch: branchName,
      }),
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload file: ${response.status} ${error}`);
  }

  return response;
}

export async function createPullRequest(
  branchName: string,
  prompt: string,
  siteId: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `Add generated website (site-${siteId})`,
        head: branchName,
        base: "main",
        body: `### Generated Website\n\n**Prompt:** ${prompt}\n\n**Site ID:** ${siteId}\n\nThis PR was automatically created by PromptSite AI.`,
      }),
    }
  );
  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to create pull request: ${response.status} ${error}`
    );
  }

  return response;
}
