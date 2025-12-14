import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { createBranch, uploadFile, createPullRequest } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // Best Groq model for HTML generation
      messages: [
        {
          role: "system",
          content: `
You are a professional UI designer.

RULES:
- NEVER use Markdown.
- NEVER include backticks.
- Output ONLY valid HTML.
- Use this layout structure:

<html>
<head>
<style>
  body { margin: 0; font-family: Arial, sans-serif; line-height: 1.6; }
  header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
  .hero { 
    height: 80vh; 
    background-size: cover; 
    background-position: center; 
    display: flex; 
    flex-direction: column; 
    justify-content: center; 
    align-items: center;
    color: white; 
    text-shadow: 0 0 10px rgba(0,0,0,0.5);
  }
  .section { padding: 60px 20px; max-width: 1100px; margin: auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
  img { width: 100%; border-radius: 10px; }
  .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
  footer { background: #111; color: white; text-align: center; padding: 20px; margin-top: 40px; }
</style>
</head>

<body>
  <header>
    <h1>{{title}}</h1>
  </header>

  <div class="hero" style="background-image: url('{{heroImage}}');">
    <h2>{{heading}}</h2>
    <p>{{subheading}}</p>
  </div>

  <div class="section">
    <h2>{{sectionTitle}}</h2>
    <div class="grid">
      {{cards}}
    </div>
  </div>

  <footer>
    <p>{{footer}}</p>
  </footer>
</body>
</html>

Your job:
- Replace {{placeholders}} with content.
- Replace {{cards}} with 3–6 cards using .card style.
- Use images from https://picsum.photos or https://source.unsplash.com
- ALWAYS generate beautiful UI with spacing & consistent design.
  `,
        },
        {
          role: "user",
          content: `
Generate website content based on this description:

"${prompt}"

Output ONLY pure HTML for the template provided.
Do NOT output Markdown. Do NOT output code fences.
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const html =
      response.choices[0].message?.content || "<h1>Error generating site</h1>";

    const cleaned = html.replace(/```/g, "").trim();

    // Create unique site folder
    const id = Date.now().toString();
    const folder = path.join(process.cwd(), "generated-sites", `site-${id}`);

    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, "index.html"), cleaned);

    const branchName = `site-${id}`;

    await createBranch(branchName);
    await uploadFile(
      branchName,
      `generated-sites/site-${id}/index.html`,
      cleaned
    );
    const prResponse = await createPullRequest(branchName, prompt, id);
    if (!prResponse.ok) {
      const errorText = await prResponse.text();
      throw new Error(`Failed to create PR: ${prResponse.status} ${errorText}`);
    }
    const prData = await prResponse.json();

    if (process.env.VERCEL_DEPLOY_HOOK) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK, { method: "POST" });
    }

    return NextResponse.json({
      success: true,
      id,
      siteUrl: `/site/${id}`,
      githubBranch: branchName,
      pullRequest: prData?.html_url || null,
    });
  } catch (error) {
    console.error("Error generating site:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
