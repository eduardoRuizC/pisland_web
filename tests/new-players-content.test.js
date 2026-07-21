import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateNewsItem, validateNewsManifest } from "../js/validation/news-validator.js";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the new-players news is valid and leads the current manifest", async () => {
  const manifest = JSON.parse(await readProjectFile("news/index.json"));
  const newsItem = JSON.parse(await readProjectFile("news/nuevos-jugadores.json"));

  assert.equal(validateNewsManifest(manifest), manifest);
  assert.equal(validateNewsItem(newsItem), newsItem);
  assert.deepEqual(newsItem, {
    id: "nuevos-jugadores",
    title: "Nuevos jugadores",
    description: "Un nuevo jugador se une a cada equipo de Pisland.",
    href: "#partido",
    icon: "groups",
  });

  assert.deepEqual(manifest.news, ["nuevos-jugadores.json", "dress-code.json"]);
});

test("the player announcement has one ordered slot per team and is the active dialog", async () => {
  const [dialogMarkup, indexMarkup] = await Promise.all([
    readProjectFile("dialogs/jugadores-v3.html"),
    readProjectFile("index.html"),
  ]);
  const slots = [...dialogMarkup.matchAll(/data-player-slot="([^"]+)"/gu)]
    .map((match) => match[1]);
  const playerImages = [...dialogMarkup.matchAll(/<img\b[^>]*\bdata-player-image\b[^>]*>/gu)]
    .map((match) => match[0]);
  const playerNames = [...dialogMarkup.matchAll(/data-player-name>([^<]+)</gu)]
    .map((match) => match[1]);

  assert.deepEqual(slots, ["team-a", "team-c", "team-b", "team-d"]);
  assert.deepEqual(playerNames, ["Anuska", "Pabloski", "Andrea", "Ely"]);
  assert.equal(playerImages.length, 4);
  assert.deepEqual(
    playerImages.map((image) => image.match(/\ssrc="([^"]+)"/u)?.[1]),
    [
      "assets/teams/rompediscotecas/anasinfondo.png",
      "assets/teams/gargolas/pabloskisinfondo.png",
      "assets/teams/bichotas/andreasinfondo.png",
      "assets/teams/sangre-nueva/elysinfondo.png",
    ],
  );
  playerImages.forEach((image) => {
    assert.match(image, /data-player-image/u);
    assert.match(image, /data-player-image-fallback="assets\/player-card-template\.png"/u);
    assert.match(image, /loading="lazy"/u);
    assert.match(image, /\ssrc="[^"]+"/u);
    assert.match(image, /\salt="[^"]+"/u);
  });
  assert.doesNotMatch(dialogMarkup, /<(?:iframe|video)\b/iu);
  assert.match(dialogMarkup, /^<dialog[\s\S]*data-trailer-modal/u);
  assert.match(dialogMarkup, /aria-labelledby="jugadores-modal-title"/u);
  assert.match(dialogMarkup, /data-close-trailer-modal/u);
  assert.doesNotMatch(dialogMarkup, /<(?:script|style)\b/iu);
  assert.match(indexMarkup, /data-manifest-url="news\/index\.json\?v=1"/u);
  assert.match(indexMarkup, /data-dialog-src="dialogs\/jugadores-v3\.html\?v=1"/u);
});

test("player drops accumulate while unrevealed players remain inactive", async () => {
  const teamFiles = [
    "teams/rompediscotecas.json",
    "teams/gargolas.json",
    "teams/bichotas.json",
    "teams/sangre-nueva.json",
  ];
  const teams = await Promise.all(
    teamFiles.map(async (path) => JSON.parse(await readProjectFile(path))),
  );

  assert.deepEqual(
    teams.map((team) => team.players.filter((player) => player.active).map((player) => player.name)),
    [
      ["Indio", "Anuska", "Sara Hippie"],
      ["Ivan", "Diana", "Pabloski"],
      ["Iván", "Andrea", "Geen"],
      ["Ely", "Emma", "Paola"],
    ],
  );
});
