import { validateDressCodeManifest } from "../validation/dress-code-validator.js";

export async function loadDressCode(manifestUrl, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch.");
  }

  const response = await fetchImpl(manifestUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`La petición a ${manifestUrl} devolvió ${response.status}.`);
  }

  const manifest = validateDressCodeManifest(await response.json());
  const absoluteManifestUrl = new URL(
    manifestUrl,
    globalThis.location?.href ?? "http://localhost/",
  );
  const baseUrl = new URL(".", absoluteManifestUrl);

  return manifest.photos.map((filename, index) => ({
    file: filename,
    alt: `Foto de Dress Code ${index + 1}`,
    src: new URL(filename, baseUrl).href,
  }));
}
