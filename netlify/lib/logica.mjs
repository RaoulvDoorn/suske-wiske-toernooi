// Gedeelde logica voor de functies. `db` is een object met een `sql` tagged-template-functie
// (zoals getDatabase() van @netlify/database) die een array met rijen teruggeeft.

export const MAX_DUELS_PER_VERZOEK = 64;
const MODI = new Set(["16", "32", "64", "alles"]);
const isGeheel = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

export function controleerStemmen(body) {
  if (!body || typeof body !== "object") return "Ongeldige gegevens.";
  const { sessie, modus, deelnemers, duels, kampioen } = body;
  if (typeof sessie !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(sessie)) return "Ongeldige sessie.";
  if (!MODI.has(modus)) return "Ongeldige modus.";
  if (!isGeheel(deelnemers, 2, 2000)) return "Ongeldig aantal deelnemers.";
  if (!Array.isArray(duels) || duels.length > MAX_DUELS_PER_VERZOEK) return "Te veel of ongeldige duels.";
  for (const d of duels) {
    if (!d || !isGeheel(d.w, 1, 9999) || !isGeheel(d.l, 1, 9999) || d.w === d.l || !isGeheel(d.veld, 2, 4096)) return "Ongeldig duel.";
  }
  if (kampioen !== undefined && !isGeheel(kampioen, 1, 9999)) return "Ongeldige kampioen.";
  if (!duels.length && kampioen === undefined) return "Niets om op te slaan.";
  return null;
}

export async function slaStemmenOp(db, body) {
  const fout = controleerStemmen(body);
  if (fout) return { status: 400, body: { fout } };
  const { sessie, modus, deelnemers, duels, kampioen } = body;

  // Een toernooi met n albums heeft hooguit n-1 duels; meer is niet eerlijk.
  const [{ n }] = await db.sql`SELECT COUNT(*)::int AS n FROM duels WHERE sessie = ${sessie}`;
  if (n + duels.length > deelnemers - 1) return { status: 409, body: { fout: "Dit toernooi heeft al genoeg stemmen." } };

  if (duels.length) {
    const w = duels.map(d => d.w), l = duels.map(d => d.l), v = duels.map(d => d.veld);
    await db.sql`
      INSERT INTO duels (sessie, winnaar, verliezer, veld, modus)
      SELECT ${sessie}, t.w, t.l, t.v, ${modus}
      FROM unnest(${w}::int[], ${l}::int[], ${v}::int[]) AS t(w, l, v)`;
  }
  let kampioenOpgeslagen = false;
  if (kampioen !== undefined) {
    const rijen = await db.sql`
      INSERT INTO kampioenen (sessie, album, deelnemers, modus)
      VALUES (${sessie}, ${kampioen}, ${deelnemers}, ${modus})
      ON CONFLICT (sessie) DO NOTHING
      RETURNING sessie`;
    kampioenOpgeslagen = rijen.length > 0;
  }
  return { status: 200, body: { ok: true, duels: duels.length, kampioen: kampioenOpgeslagen } };
}

export async function haalRanglijst(db) {
  const albums = await db.sql`
    SELECT album, SUM(w)::int AS w, SUM(l)::int AS l
    FROM (
      SELECT winnaar AS album, 1 AS w, 0 AS l FROM duels
      UNION ALL
      SELECT verliezer AS album, 0 AS w, 1 AS l FROM duels
    ) t
    GROUP BY album`;
  const kampioenen = await db.sql`SELECT album, COUNT(*)::int AS k FROM kampioenen GROUP BY album`;
  const [totaal] = await db.sql`
    SELECT (SELECT COUNT(*)::int FROM duels) AS duels,
           (SELECT COUNT(DISTINCT sessie)::int FROM duels) AS toernooien,
           (SELECT COUNT(*)::int FROM kampioenen) AS afgemaakt`;
  const recent = await db.sql`
    SELECT album, deelnemers, modus, gemaakt FROM kampioenen ORDER BY gemaakt DESC LIMIT 10`;
  const k = new Map(kampioenen.map(r => [r.album, r.k]));
  const lijst = albums.map(r => ({ nr: r.album, w: r.w, l: r.l, k: k.get(r.album) || 0 }));
  for (const [album, aantal] of k) if (!lijst.some(r => r.nr === album)) lijst.push({ nr: album, w: 0, l: 0, k: aantal });
  return {
    bijgewerkt: new Date().toISOString(),
    totaal,
    albums: lijst,
    recent: recent.map(r => ({ nr: r.album, deelnemers: r.deelnemers, modus: r.modus, gemaakt: new Date(r.gemaakt).toISOString() })),
  };
}
