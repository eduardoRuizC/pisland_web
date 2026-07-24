import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  PLAYER_STAT_DEFINITIONS,
  PLAYER_STAT_KEYS,
  getPlayerStatEntries,
} from "../js/utils/player-stats.js";
import { validateManifest, validatePlayer, validateTeam } from "../js/validation/team-validator.js";

const expectedKeys = ["VN", "PR", "CA", "MS", "UE", "PC"];
const expectedLabels = [
  "Visión de la noche",
  "Perreocidad",
  "Capacidad de alcohol",
  "Misiones secundarias",
  "Unión de equipo",
  "Picardía",
];

function createPlayer(stats) {
  return {
    name: "Jugador de prueba",
    position: "DC",
    description: "Descripción de prueba",
    active: true,
    captain: true,
    rating: 90,
    x: 50,
    y: 20,
    stats,
  };
}

test("defines the Pisland stats once in their display order", () => {
  assert.deepEqual([...PLAYER_STAT_KEYS], expectedKeys);
  assert.deepEqual(PLAYER_STAT_DEFINITIONS.map(({ label }) => label), expectedLabels);

  const entries = getPlayerStatEntries({ PC: 6, UE: 5, MS: 4, CA: 3, PR: 2, VN: 1 });
  assert.deepEqual(entries.map(({ key }) => key), expectedKeys);
  assert.deepEqual(entries.map(({ label }) => label), expectedLabels);
  assert.deepEqual(entries.map(({ value }) => value), [1, 2, 3, 4, 5, 6]);
});

test("player validation requires exactly the six Pisland stats", () => {
  const validStats = { VN: 1, PR: 2, CA: 3, MS: 4, UE: 5, PC: 6 };
  const player = createPlayer(validStats);
  assert.equal(validatePlayer(player), player);

  assert.throws(
    () => validatePlayer(createPlayer({ VN: 1, PR: 2, CA: 3, MS: 4, UE: 5 })),
    /deben ser VN, PR, CA, MS, UE, PC/u,
  );
  assert.throws(
    () => validatePlayer(createPlayer({ ...validStats, PAC: 99 })),
    /deben ser VN, PR, CA, MS, UE, PC/u,
  );
});

test("every team uses the new stats and versioned public data URLs", async () => {
  const manifestUrl = new URL("../teams/index.json", import.meta.url);
  const manifest = validateManifest(JSON.parse(await readFile(manifestUrl, "utf8")));
  const indexMarkup = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(indexMarkup, /data-manifest-url="teams\/index\.json\?v=15"/u);
  assert.ok(manifest.teams.every((filename) => /\.json\?v=\d+$/u.test(filename)));
  assert.ok(manifest.teams.includes("rompediscotecas.json?v=10"));
  assert.ok(manifest.teams.includes("gargolas.json?v=10"));
  assert.ok(manifest.teams.includes("bichotas.json?v=10"));
  assert.ok(manifest.teams.includes("sangre-nueva.json?v=10"));

  for (const filename of manifest.teams) {
    const dataUrl = new URL(filename.replace(/\?.*$/u, ""), manifestUrl);
    const team = validateTeam(JSON.parse(await readFile(dataUrl, "utf8")));
    team.players.forEach((player) => {
      assert.deepEqual(Object.keys(player.stats), expectedKeys);
      assert.doesNotMatch(player.description, /\b(?:PAC|SHO|PAS|DRI|DEF|PHY|EST|MAN|SAQ|REF|VEL|POS)\b/u);
    });
  }
});

test("the team manifest accepts numeric cache versions and rejects malformed ones", () => {
  assert.doesNotThrow(() => validateManifest({ teams: ["equipo.json?v=2"] }));
  assert.throws(
    () => validateManifest({ teams: ["equipo.json?version=2"] }),
    /no es un nombre JSON válido/u,
  );
});
