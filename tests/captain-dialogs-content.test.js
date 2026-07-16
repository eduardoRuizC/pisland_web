import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const captainDialogs = [
  "capitan-rompediscotecas-v1.html",
  "capitan-gargolas-v1.html",
  "capitan-bichotas-v1.html",
  "capitan-sangre-nueva-v1.html",
];

test("every captain dialog has a configured video or an editable YouTube Short placeholder", async () => {
  for (const filename of captainDialogs) {
    const markup = await readFile(new URL(`../dialogs/${filename}`, import.meta.url), "utf8");
    const iframe = markup.match(/<iframe[\s\S]*?<\/iframe>/u)?.[0] ?? "";

    assert.match(iframe, /allowfullscreen/u, filename);
    if (/\ssrc=/u.test(iframe)) {
      assert.match(iframe, /src="https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[a-zA-Z0-9_-]+/u, filename);
      assert.match(iframe, /title="[^"]+"/u, filename);
    } else {
      assert.match(iframe, /data-youtube-short/u, filename);
      assert.match(iframe, /tabindex="-1"/u, filename);
      assert.match(markup, /class="captain-announcement__short-placeholder"/u, filename);
    }
  }
});
