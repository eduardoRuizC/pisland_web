import test from "node:test";
import assert from "node:assert/strict";

import { loadDressCode } from "../js/services/dress-code-repository.js";

test("Dress Code resolves image URLs and preserves manifest order", async () => {
  const manifestUrl = "https://example.test/assets/dress-code/index.json";
  const requested = [];
  const photos = await loadDressCode(manifestUrl, async (url, options) => {
    requested.push({ url: String(url), options });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        photos: ["segunda.webp", "primera.jpg"],
      }),
    };
  });

  assert.equal(requested.length, 1);
  assert.equal(requested[0].url, manifestUrl);
  assert.equal(requested[0].options.headers.Accept, "application/json");
  assert.deepEqual(photos, [
    {
      file: "segunda.webp",
      alt: "Foto de Dress Code 1",
      src: "https://example.test/assets/dress-code/segunda.webp",
    },
    {
      file: "primera.jpg",
      alt: "Foto de Dress Code 2",
      src: "https://example.test/assets/dress-code/primera.jpg",
    },
  ]);
});

test("Dress Code reports manifest request failures", async () => {
  await assert.rejects(
    loadDressCode("https://example.test/missing.json", async () => ({
      ok: false,
      status: 404,
    })),
    /devolvió 404/u,
  );
});
