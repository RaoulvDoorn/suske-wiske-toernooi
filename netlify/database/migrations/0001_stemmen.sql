-- Elk gespeeld duel: welk album won van welk album. Geen persoonsgegevens.
CREATE TABLE duels (
  id         BIGSERIAL PRIMARY KEY,
  sessie     TEXT        NOT NULL,          -- willekeurige id per toernooi, gemaakt in de browser
  winnaar    SMALLINT    NOT NULL,          -- albumnummer
  verliezer  SMALLINT    NOT NULL,
  veld       SMALLINT    NOT NULL,          -- grootte van de ronde (bijv. 16 = achtste finale)
  modus      TEXT        NOT NULL,          -- '16', '32', '64' of 'alles'
  gemaakt    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (winnaar <> verliezer)
);
CREATE INDEX duels_sessie_idx ON duels (sessie);

-- Eén kampioen per afgemaakt toernooi.
CREATE TABLE kampioenen (
  sessie      TEXT        PRIMARY KEY,
  album       SMALLINT    NOT NULL,
  deelnemers  SMALLINT    NOT NULL,
  modus       TEXT        NOT NULL,
  gemaakt     TIMESTAMPTZ NOT NULL DEFAULT now()
);
