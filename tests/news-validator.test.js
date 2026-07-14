import test from "node:test";
import assert from "node:assert/strict";

import { validateNewsItem, validateNewsManifest } from "../js/validation/news-validator.js";

test("validateNewsManifest accepts an ordered manifest", () => {
  const manifest = { news: ["primera.json", "segunda-noticia.json"] };
  assert.equal(validateNewsManifest(manifest), manifest);
});

test("validateNewsManifest rejects duplicate and invalid filenames", () => {
  assert.throws(
    () => validateNewsManifest({ news: ["repetida.json", "repetida.json"] }),
    /repite el archivo/u,
  );
  assert.throws(
    () => validateNewsManifest({ news: ["No valida.json"] }),
    /no es un nombre JSON válido/u,
  );
});

test("validateNewsItem accepts optional relative, anchor and HTTP links", () => {
  const base = { id: "noticia", title: "Noticia", description: "Descripción" };
  assert.equal(validateNewsItem(base), base);
  assert.doesNotThrow(() => validateNewsItem({ ...base, label: "Soon" }));
  assert.doesNotThrow(() => validateNewsItem({ ...base, icon: "sports_soccer" }));
  assert.doesNotThrow(() => validateNewsItem({ ...base, href: "#partido" }));
  assert.doesNotThrow(() => validateNewsItem({ ...base, href: "noticias/detalle.html" }));
  assert.doesNotThrow(() => validateNewsItem({ ...base, href: "https://example.com/noticia" }));
});

test("validateNewsItem rejects invalid data and unsafe protocols", () => {
  assert.throws(
    () => validateNewsItem({ id: "Noticia", title: "Noticia", description: "Descripción" }),
    /solo puede usar minúsculas/u,
  );
  assert.throws(
    () => validateNewsItem({
      id: "noticia",
      title: "Noticia",
      description: "Descripción",
      icon: "Sports Soccer",
    }),
    /Material Symbols válido/u,
  );
  assert.throws(
    () => validateNewsItem({
      id: "noticia",
      title: "Noticia",
      description: "Descripción",
      label: "",
    }),
    /etiqueta/u,
  );
  assert.throws(
    () => validateNewsItem({
      id: "noticia",
      title: "Noticia",
      description: "Descripción",
      href: "javascript:alert(1)",
    }),
    /relativo, un ancla o una URL HTTP\(S\)/u,
  );
});
