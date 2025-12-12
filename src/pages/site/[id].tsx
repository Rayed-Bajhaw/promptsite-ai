import fs from "fs";
import path from "path";
import { GetServerSideProps } from "next";

interface Props {
  html: string;
}

export default function Site({ html }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const folder = path.join(process.cwd(), "generated-sites", `site-${id}`);
  const filePath = path.join(folder, "index.html");

  let html = "<h1>Site not found</h1>";

  if (fs.existsSync(filePath)) {
    html = fs.readFileSync(filePath, "utf8");
  }

  return {
    props: { html },
  };
};
