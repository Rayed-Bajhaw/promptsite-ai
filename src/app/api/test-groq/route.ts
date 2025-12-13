import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Say hello!" }],
    });

    return NextResponse.json({
      ok: true,
      message: res.choices[0].message.content,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
