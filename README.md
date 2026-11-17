# Het grote Suske en Wiske-toernooi

Onofficieel fanproject: kies steeds tussen twee albums uit de rode reeks tot er één favoriet overblijft. Alle keuzes worden anoniem opgeteld in een community-ranglijst.

## Wat zit er in deze map

| Bestand | Wat het doet |
|---|---|
| `index.html` | Het toernooi (snelle modus, Ken ik niet, veto, overzicht, schema, deelafbeelding, fout melden) |
| `ranglijst.html` | De community-ranglijst |
| `albums.js` | De albumlijst (nr. 67 t/m 385). Hier voeg je nieuwe albums toe |
| `style.css` | Opmaak voor beide pagina's |
| `og-image.png` | Het plaatje dat Reddit, WhatsApp en dergelijke tonen bij een link |
| `netlify/functions/stemmen.mjs` | Ontvangt stemmen (`POST /api/stemmen`) |
| `netlify/functions/ranglijst.mjs` | Geeft de opgetelde ranglijst (`GET /api/ranglijst`), 2 minuten gecachet |
| `netlify/lib/logica.mjs` | Controles en databasequery's die de functies delen |
| `netlify/database/migrations/0001_stemmen.sql` | Maakt de twee tabellen aan (`duels` en `kampioenen`) |
| `package.json`, `package-lock.json`, `netlify.toml` | Instellingen voor Netlify |

## Online zetten (via GitHub, aanbevolen)

Slepen en neerzetten op Netlify werkt hier **niet**, want de database en de functies moeten door Netlify worden gebouwd. Via GitHub gaat dat vanzelf, en elke wijziging staat daarna automatisch online.

1. **Maak een GitHub-repository.** Ga naar github.com → *New repository* → naam bijvoorbeeld `suske-wiske-toernooi` → *Create*. Klik op *uploading an existing file* en sleep **de inhoud** van deze map erin (dus `index.html` enz., niet de map zelf). De mappen `netlify/...` gaan mee als je ze meesleept. Klik op *Commit changes*.
2. **Koppel het aan Netlify.** In Netlify: *Add new project* → *Import an existing project* → *GitHub* → kies je repository. De instellingen komen uit `netlify.toml`, dus je hoeft niets in te vullen. Klik op *Deploy*.
3. **De database komt vanzelf.** Omdat het project `@netlify/database` gebruikt en een migratie in `netlify/database/migrations/` heeft, maakt Netlify bij de eerste deploy de database aan en voert het de migratie uit. Lukt dat niet, ga dan naar *Data & Storage* → *Database* → *Create a database manually* en deploy opnieuw.
4. **Zet "Fout gezien?" aan.** Ga naar *Project configuration* → *Forms* → *Enable form detection* en deploy daarna nog één keer (*Deploys* → *Trigger deploy*). Meldingen komen binnen onder *Forms*. Daar kun je ook een e-mailmelding instellen.
5. **Kies een mooi adres.** *Project configuration* → *Change project name*, bijvoorbeeld `suske-wiske-toernooi` → `suske-wiske-toernooi.netlify.app`.
6. **Pas het Reddit-plaatje aan.** Vervang in `index.html` en `ranglijst.html` de tekst `JOUW-SITE` door je projectnaam (in GitHub: bestand openen → potloodje → aanpassen → *Commit*). Zonder deze stap toont Reddit geen plaatje bij je link.
7. **Test het.** Speel een Supersnel-toernooi (15 duels) en open daarna de ranglijst. Je stemmen moeten daar binnen een paar minuten staan.

### Alternatief: met de Netlify CLI

```bash
npm install
npx netlify login
npx netlify init          # nieuw project aanmaken of koppelen
npx netlify deploy --prod
```

Lokaal testen, inclusief een lokale database: `npx netlify dev`.

## Een nieuw album toevoegen

Open `albums.js` (op GitHub met het potloodje) en voeg onderaan een regel toe, bijvoorbeeld:

```js
[386, "Titel van het nieuwe album"]
```

Let op de komma achter de regel ervoor. Pas ook `SW_LIJST_STAND` bovenaan aan en klik op *Commit*. Netlify zet het binnen een minuut online, en lopende toernooien van bezoekers blijven gewoon werken.

## Wat wordt er opgeslagen

- **In de database:** per duel alleen winnaar, verliezer, de grootte van de ronde, de modus en een willekeurige toernooi-id die de browser zelf maakt. Per afgemaakt toernooi de kampioen. Er worden geen namen, accounts, IP-adressen of cookies opgeslagen.
- **Duels die niet meetellen:** als iemand "Ken ik niet" koos of het lot liet beslissen.
- **Hoe stemmen binnenkomen:** per afgeronde ronde in groepjes van maximaal 64 duels. Zo blijft het aantal verzoeken laag: een heel toernooi van 319 albums kost ongeveer 10 verzoeken. Het tempo is begrensd op 30 verzoeken per minuut per bezoeker.
- **Controle op valsspelen:** een toernooi met n albums kan hooguit n−1 stemmen inleveren, en één kampioen.

## Kosten en limieten

Het gratis Netlify-plan werkt met maandelijkse credits. Als die op zijn, gaat de site tot het einde van de maand op pauze. Houd na een Reddit-post het verbruik in de gaten via *Usage* in Netlify. De ranglijst wordt 2 minuten gecachet, zodat niet elke bezoeker de database belast.

## Statistieken leegmaken

Zet een nieuw bestand in `netlify/database/migrations/`, bijvoorbeeld `0002_reset.sql`, met deze inhoud:

```sql
TRUNCATE duels, kampioenen;
```

Bij de volgende deploy voert Netlify het één keer uit.

## Rechten

Suske en Wiske is gemaakt door Willy Vandersteen. Alle rechten liggen bij Standaard Uitgeverij. Deze site is een onofficieel fanproject en gebruikt bewust alleen albumnummers en titels: geen covers, logo's of tekeningen. Houd dat zo.
