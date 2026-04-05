// NutriAndré — Proxy backend para Anthropic API
import { readFileSync } from "fs";
import { join } from "path";

// Leer API key directamente del archivo .env.local
// (process.env puede ser sobreescrita por el entorno del proceso padre)
function getApiKey() {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv && fromEnv.startsWith("sk-ant-")) return fromEnv;

  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim() || "";
  } catch {
    return "";
  }
}

export async function POST(req) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY no configurada en .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model,
        max_tokens: body.max_tokens || 550,
        system: body.system,
        messages: body.messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `Anthropic API error: ${res.status}`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: "Error interno del proxy", details: err.message },
      { status: 500 }
    );
  }
}
