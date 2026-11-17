// GET /api/ranglijst: telt alle stemmen op per album. Netlify bewaart het antwoord 2 minuten in de cache,
// zodat de database niet bij elke bezoeker opnieuw hoeft te rekenen.
import { getDatabase } from "@netlify/database";
import { haalRanglijst } from "../lib/logica.mjs";

export default async () => {
  try {
    const data = await haalRanglijst(getDatabase());
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (e) {
    console.error("ranglijst ophalen mislukt", e);
    return new Response(JSON.stringify({ fout: "De ranglijst is even niet beschikbaar." }), {
      status: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
};

export const config = { path: "/api/ranglijst", method: "GET" };
