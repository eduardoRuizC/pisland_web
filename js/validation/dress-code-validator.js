function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} debe ser un texto no vacío.`);
  }
}

export function validateDressCodeManifest(manifest) {
  if (!isPlainObject(manifest) || !Array.isArray(manifest.photos)) {
    throw new TypeError('El manifest debe incluir un array "photos".');
  }

  const filenames = new Set();
  manifest.photos.forEach((filename, index) => {
    assertNonEmptyString(filename, `El archivo de la foto ${index + 1}`);
    if (!/^(?!.*\.\.)[a-z0-9][a-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/iu.test(filename)) {
      throw new TypeError(`El archivo "${filename}" no es un nombre de imagen válido.`);
    }

    const normalizedFilename = filename.toLocaleLowerCase("en");
    if (filenames.has(normalizedFilename)) {
      throw new Error(`El manifest repite el archivo "${filename}".`);
    }
    filenames.add(normalizedFilename);
  });

  return manifest;
}
