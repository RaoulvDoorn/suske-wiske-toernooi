// POST /api/stemmen: slaat een groepje gespeelde duels (en eventueel de kampioen) anoniem op.
import { getDatabase } from "@netlify/database";
import { slaStemmenOp } from "../lib/logica.mjs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export default async (req) => {
  if (req.method !== "POST") return json({ fout: "Gebruik POST." }, 405);
  if (Number(req.headers.get("content-length") || 0) > 20000) return json({ fout: "Te groot." }, 413);
  let body;
  try { body = await req.json(); } catch { return json({ fout: "Geen geldige JSON." }, 400); }
  try {
    const res = await slaStemmenOp(getDatabase(), body);
    return json(res.body, res.status);
  } catch (e) {
    console.error("stemmen opslaan mislukt", e);
    return json({ fout: "Opslaan lukte even niet." }, 503);
  }
};

export const config = {
  path: "/api/stemmen",
  method: "POST",
  // Hooguit 30 verzoeken per minuut per bezoeker; een heel toernooi van 319 albums heeft er ongeveer 10 nodig.
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
