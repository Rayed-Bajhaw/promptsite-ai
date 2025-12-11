import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  const { id, html } = body;

  const folder = path.join(process.cwd(), "generated-sites", `site-${id}`);
  const filePath = path.join(folder, "index.html");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  fs.writeFileSync(filePath, html);

  return Response.json({ success: true });
}
