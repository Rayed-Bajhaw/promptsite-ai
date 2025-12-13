export const runtime = "nodejs";
import fs from "fs";
import path from "path";

export default function SitePage({ params }: { params: { id: string } }) {
  const siteFolder = `site-${params.id}`;
  const filePath = path.join(
    process.cwd(),
    "generated-sites",
    siteFolder,
    "index.html"
  );

  let content = "<h1>Site Not Found</h1>";

  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");
  }

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
