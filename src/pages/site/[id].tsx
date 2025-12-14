import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";
import DOMPurify from "isomorphic-dompurify";

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;

export default function Site({ cleanBody, styleContent }: any) {
  return (
    <>
      <style jsx global>
        {styleContent}
      </style>
      <div dangerouslySetInnerHTML={{ __html: cleanBody }} />
    </>
  );
}

export async function getServerSideProps({ params }: any) {
  const { id } = params;

  let html = "";

  if (!process.env.VERCEL) {
    console.log("Running locally → reading from local folder");

    const localPath = path.join(
      process.cwd(),
      "generated-sites",
      `site-${id}`,
      "index.html"
    );

    if (!fs.existsSync(localPath)) {
      return {
        props: {
          cleanBody: "<h1>Site not found locally</h1>",
          styleContent: "",
        },
      };
    }

    html = fs.readFileSync(localPath, "utf8");
  } else {
    console.log("Running on Vercel → fetching from GitHub RAW");

    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/generated-sites/site-${id}/index.html`;
    const githubResponse = await fetch(url);

    if (!githubResponse.ok) {
      return {
        props: {
          cleanBody: "<h1>Site not found on GitHub</h1>",
          styleContent: "",
        },
      };
    }

    html = await githubResponse.text();
  }

  let root;
  try {
    root = parse(html);
  } catch (err) {
    return {
      props: {
        cleanBody: html,
        styleContent: "",
      },
    };
  }

  const styleTag = root.querySelector("style");
  const bodyTag = root.querySelector("body");

  const styleContent = styleTag?.innerHTML || "";
  const bodyHtml = bodyTag?.innerHTML || html;

  let cleanBody = bodyHtml;
  try {
    cleanBody = DOMPurify.sanitize(bodyHtml, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["script"],
      FORBID_ATTR: ["onclick", "onerror", "onload"],
      ALLOWED_ATTR: ["href", "src", "alt", "class", "id", "style"],
      ALLOWED_URI_REGEXP: /^https?:\/\//i,
    });
  } catch (err) {
    console.error("Sanitization error:", err);
  }

  return {
    props: {
      cleanBody,
      styleContent,
    },
  };
}
