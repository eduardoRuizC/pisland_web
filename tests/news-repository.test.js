import test from "node:test";
import assert from "node:assert/strict";

import { loadNews } from "../js/services/news-repository.js";

function createFetch(responses, calls) {
  return async (input) => {
    const url = String(input);
    calls.push(url);
    if (!responses.has(url)) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, status: 200, json: async () => responses.get(url) };
  };
}

test("loadNews fetches only listed files and preserves manifest order", async () => {
  const manifestUrl = "https://example.test/news/index.json";
  const calls = [];
  const responses = new Map([
    [manifestUrl, { news: ["segunda.json", "primera.json"] }],
    ["https://example.test/news/primera.json", {
      id: "primera",
      title: "Primera",
      description: "Primera por nombre de archivo",
    }],
    ["https://example.test/news/segunda.json", {
      id: "segunda",
      title: "Segunda",
      description: "Primera por orden del manifest",
      href: "#partido",
    }],
    ["https://example.test/news/no-listada.json", {
      id: "no-listada",
      title: "No listada",
      description: "No debe cargarse",
    }],
  ]);

  const result = await loadNews(manifestUrl, createFetch(responses, calls));
  assert.deepEqual(result.news.map(({ id }) => id), ["segunda", "primera"]);
  assert.deepEqual(result.errors, []);
  assert.equal(calls.includes("https://example.test/news/no-listada.json"), false);
});

test("loadNews isolates invalid files and duplicate ids", async () => {
  const manifestUrl = "https://example.test/news/index.json";
  const calls = [];
  const responses = new Map([
    [manifestUrl, { news: ["valida.json", "invalida.json", "duplicada.json"] }],
    ["https://example.test/news/valida.json", {
      id: "valida",
      title: "Válida",
      description: "Se conserva",
    }],
    ["https://example.test/news/invalida.json", {
      id: "invalida",
      title: "",
      description: "Se descarta",
    }],
    ["https://example.test/news/duplicada.json", {
      id: "valida",
      title: "Duplicada",
      description: "Se descarta",
    }],
  ]);

  const result = await loadNews(manifestUrl, createFetch(responses, calls));
  assert.deepEqual(result.news.map(({ id }) => id), ["valida"]);
  assert.deepEqual(result.errors.map(({ filename }) => filename), ["invalida.json", "duplicada.json"]);
});
