import { validateNewsItem, validateNewsManifest } from "../validation/news-validator.js";

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`La petición a ${url} devolvió ${response.status}.`);
  }
  return response.json();
}

export async function loadNews(manifestUrl, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch.");
  }

  const manifest = validateNewsManifest(await fetchJson(manifestUrl, fetchImpl));
  const baseUrl = new URL(".", new URL(manifestUrl, globalThis.location?.href ?? "http://localhost/"));
  const results = await Promise.allSettled(
    manifest.news.map(async (filename) => {
      const newsItem = await fetchJson(new URL(filename, baseUrl), fetchImpl);
      return validateNewsItem(newsItem);
    }),
  );

  const news = [];
  const errors = [];
  const ids = new Set();

  results.forEach((result, index) => {
    const filename = manifest.news[index];
    if (result.status === "rejected") {
      errors.push({ filename, error: result.reason });
      return;
    }
    if (ids.has(result.value.id)) {
      errors.push({ filename, error: new Error(`El id "${result.value.id}" está duplicado.`) });
      return;
    }
    ids.add(result.value.id);
    news.push(result.value);
  });

  return { news, errors };
}
