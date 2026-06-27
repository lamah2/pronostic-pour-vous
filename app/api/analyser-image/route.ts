import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { base64, type } = await req.json();

    const prompt = type === "pct"
      ? "Extrait tous les noms de chevaux et leurs pourcentages. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks: [{\"nom\":\"NomCheval\",\"pct\":14.98},...]. Convertis les virgules en points."
      : "Extrait tous les numéros et noms de chevaux de ce tableau. Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks: [{\"num\":1,\"nom\":\"MARILOU\"},...].";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
          { type: "text", text: prompt }
        ]}]
      }),
    });

    const data = await response.json();
    const txt = data.content.map((i: any) => i.text || "").join("");
    const result = JSON.parse(txt.replace(/```json|```/g, "").trim());
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}