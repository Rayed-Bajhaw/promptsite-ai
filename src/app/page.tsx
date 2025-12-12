"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  async function generateSite() {
    setLoading(true);

    const res = await fetch("/api/generate-site", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSiteUrl(data.url);
    } else {
      alert("Error generating site");
    }
  }
  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-5">AI Website Generator</h1>

      <textarea
        className="w-full p-3 border rounded"
        placeholder="Describe the website you want..."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        className="mt-4 p-3 bg-blue-600 text-white rounded w-full"
        onClick={generateSite}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Website"}
      </button>

      {siteUrl && (
        <a
          href={siteUrl}
          target="_blank"
          className="mt-5 block text-blue-500 underline"
        >
          View Generated Website
        </a>
      )}
    </div>
  );
}
