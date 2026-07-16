import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateNewsItem, validateNewsManifest } from "../js/validation/news-validator.js";

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the new-players news is valid and follows capitan-4 in the manifest", async () => {
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

  const captainIndex = manifest.news.indexOf("capitan-4.json");
  assert.notEqual(captainIndex, -1);
  assert.equal(manifest.news[captainIndex + 1], "nuevos-jugadores.json");
  assert.equal(manifest.news[captainIndex + 2], "dress-code.json");
});

test("the player announcement has one ordered slot per team and stays inactive", async () => {
  const [dialogMarkup, indexMarkup] = await Promise.all([
    readProjectFile("dialogs/jugadores-v1.html"),
    readProjectFile("index.html"),
  ]);
  const slots = [...dialogMarkup.matchAll(/data-player-slot="([^"]+)"/gu)]
    .map((match) => match[1]);
  const videoFrames = [...dialogMarkup.matchAll(/<iframe[\s\S]*?<\/iframe>/gu)]
    .map((match) => match[0]);

  assert.deepEqual(slots, ["team-a", "team-c", "team-b", "team-d"]);
  assert.equal(videoFrames.length, 4);
  videoFrames.forEach((iframe) => {
    assert.match(iframe, /data-player-video/u);
    assert.match(iframe, /data-youtube-short/u);
    assert.match(iframe, /tabindex="-1"/u);
    assert.match(iframe, /allowfullscreen/u);
    assert.doesNotMatch(iframe, /\ssrc=/u);
  });
  assert.equal((dialogMarkup.match(/class="player-announcement__video-placeholder"/gu) ?? []).length, 4);
  assert.match(dialogMarkup, /^<dialog[\s\S]*data-trailer-modal/u);
  assert.match(dialogMarkup, /aria-labelledby="jugadores-modal-title"/u);
  assert.match(dialogMarkup, /data-close-trailer-modal/u);
  assert.doesNotMatch(dialogMarkup, /<(?:script|style)\b/iu);
  assert.match(indexMarkup, /data-manifest-url="news\/index\.json\?v=1"/u);
  assert.match(indexMarkup, /data-dialog-src="dialogs\/capitan-bichotas-v1\.html\?v=2"/u);
  assert.doesNotMatch(indexMarkup, /data-dialog-src="dialogs\/jugadores-v1\.html"/u);
});
