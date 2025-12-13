import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";
import DOMPurify from "isomorphic-dompurify";

export default function Site({ cleanBody, styleContent }: any) {
  return (
    <>
      {/* Inject CSS using Next.js compatible global style */}
      <style jsx global>
        {styleContent}
      </style>

      {/* Render sanitized body */}
      <div dangerouslySetInnerHTML={{ __html: cleanBody }} />
    </>
  );
}

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  const filePath = path.join(
    process.cwd(),
    "generated-sites",
    `site-${id}`,
    "index.html"
  );

  let html = "<h1>Site not found</h1>";

  if (fs.existsSync(filePath)) {
    html = fs.readFileSync(filePath, "utf8");
  }

  const root = parse(html);

  // Extract <style> content
  const styleTag = root.querySelector("style");
  const styleContent = styleTag ? styleTag.innerHTML : "";

  // Extract <body> content
  const bodyTag = root.querySelector("body");
  const bodyHtml = bodyTag ? bodyTag.innerHTML : html;

  // Sanitize ONLY body
  const cleanBody = DOMPurify.sanitize(bodyHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script"],
    FORBID_ATTR: ["onclick", "onerror", "onload"],
    ALLOWED_ATTR: ["href", "src", "alt", "class", "id", "style"],
    ALLOWED_URI_REGEXP: /^https?:\/\//i, // allow safe image URLs in style attributes
  });

  return {
    props: {
      cleanBody,
      styleContent,
    },
  };
}
