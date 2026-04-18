import { NextResponse } from "next/server";
import { generateResponse } from "@/lib/data";
import type { BabyProfile } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: BabyProfile;
      message?: string;
    };

    if (!body.profile || !body.message) {
      return NextResponse.json({ error: "Missing profile or message" }, { status: 400 });
    }

    // Future hook: if OPENAI_API_KEY / Anthropic key exists, route to real LLM here.
    const reply = generateResponse(body.profile, body.message);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
