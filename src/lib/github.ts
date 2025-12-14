import fetch from "node-fetch";

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const token = process.env.GITHUB_TOKEN!;

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
  const mainData = await mainRef.json();

  return fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: mainData.object.sha,
    }),
  });
}

export async function uploadFile(
  branchName: string,
  path: string,
  content: string
) {
  const encoded = Buffer.from(content).toString("base64");

  return fetch(
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
}

export async function createPullRequest(
  branchName: string,
  prompt: string,
  siteId: string
) {
  return fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: `Add generated website (site-${siteId})`,
      head: branchName,
      base: "main",
      body: `### Generated Website\n\n**Prompt:** ${prompt}\n\n**Site ID:** ${siteId}\n\nThis PR was automatically created by PromptSite AI.`,
    }),
  });
}
