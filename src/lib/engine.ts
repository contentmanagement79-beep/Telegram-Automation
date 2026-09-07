// Server-only. Calls the bot engine's internal API with the shared secret.
export async function callEngine(path: string, body: unknown) {
  const base = process.env.BOT_ENGINE_URL;
  const token = process.env.INTERNAL_API_TOKEN;
  if (!base || !token) {
    return { ok: false, status: 500, data: { error: "Engine not configured." } };
  }
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-token": token },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 502, data: { error: "Could not reach the engine. Is it running?" } };
  }
}
