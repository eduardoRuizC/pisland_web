function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} debe ser un texto no vacío.`);
  }
}

function assertSafeHref(href) {
  assertNonEmptyString(href, "El enlace de la noticia");

  let url;
  try {
    url = new URL(href, "https://pisland.invalid/");
  } catch {
    throw new TypeError(`El enlace "${href}" no es válido.`);
  }

  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new TypeError(`El enlace "${href}" debe ser relativo, un ancla o una URL HTTP(S).`);
  }
}

export function validateNewsManifest(manifest) {
  if (!isPlainObject(manifest) || !Array.isArray(manifest.news) || manifest.news.length === 0) {
    throw new TypeError('El manifest debe incluir un array "news" no vacío.');
  }

  const filenames = new Set();
  manifest.news.forEach((filename, index) => {
    if (typeof filename !== "string" || !/^[a-z0-9][a-z0-9-]*\.json$/u.test(filename)) {
      throw new TypeError(`La entrada ${index + 1} del manifest no es un nombre JSON válido.`);
    }
    if (filenames.has(filename)) {
      throw new Error(`El manifest repite el archivo "${filename}".`);
    }
    filenames.add(filename);
  });

  return manifest;
}

export function validateNewsItem(newsItem) {
  if (!isPlainObject(newsItem)) {
    throw new TypeError("La noticia debe ser un objeto.");
  }

  assertNonEmptyString(newsItem.id, "El id de la noticia");
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(newsItem.id)) {
    throw new TypeError(`El id "${newsItem.id}" solo puede usar minúsculas, números y guiones.`);
  }

  assertNonEmptyString(newsItem.title, `El título de ${newsItem.id}`);
  assertNonEmptyString(newsItem.description, `La descripción de ${newsItem.id}`);

  if (newsItem.label !== undefined) {
    assertNonEmptyString(newsItem.label, `La etiqueta de ${newsItem.id}`);
  }

  if (newsItem.icon !== undefined) {
    assertNonEmptyString(newsItem.icon, `El icono de ${newsItem.id}`);
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/u.test(newsItem.icon)) {
      throw new TypeError(`El icono "${newsItem.icon}" debe ser un nombre de Material Symbols válido.`);
    }
  }

  if (newsItem.href !== undefined) {
    assertSafeHref(newsItem.href);
  }

  return newsItem;
}
