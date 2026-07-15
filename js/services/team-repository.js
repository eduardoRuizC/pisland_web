import { validateManifest, validateTeam } from "../validation/team-validator.js";

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`La petición a ${url} devolvió ${response.status}.`);
  }
  return response.json();
}

export async function loadTeams(manifestUrl, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Se necesita una implementación de fetch.");
  }

  const manifest = validateManifest(await fetchJson(manifestUrl, fetchImpl));
  const baseUrl = new URL(".", new URL(manifestUrl, globalThis.location?.href ?? "http://localhost/"));
  const results = await Promise.allSettled(
    manifest.teams.map(async (filename) => {
      const team = await fetchJson(new URL(filename, baseUrl), fetchImpl);
      return validateTeam(team);
    }),
  );

  const teams = [];
  const errors = [];
  const ids = new Set();

  results.forEach((result, index) => {
    const filename = manifest.teams[index];
    if (result.status === "rejected") {
      errors.push({ filename, error: result.reason });
      return;
    }
    if (ids.has(result.value.id)) {
      errors.push({ filename, error: new Error(`El id "${result.value.id}" está duplicado.`) });
      return;
    }
    ids.add(result.value.id);
    teams.push(result.value);
  });

  return { teams, errors };
}
