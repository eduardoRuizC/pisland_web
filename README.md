# pisland_web

Static GitHub Pages site for Pisland Festival - Home (Full Background Josh).

## Local development

This is a static GitHub Pages site. It does not require Node.js, a package
manager, or a build step.

Requirements:

- A modern browser.
- Python 3 for local development.

Start the site locally:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Opening `index.html` directly with a `file://` URL is not supported. Native ES
modules and the team JSON files require an HTTP server. GitHub Pages already
serves the project over HTTP.

Development notes:

- Edit page structure in `index.html`.
- Edit visual styles and responsive behavior in `styles.css`.
- Edit application behavior in the modules under `js/`.
- Edit team names, players, photos, descriptions, positions and statistics in `teams/`.
- Keep static assets in `assets/` and reference them with relative paths.
- There is no compile step; refresh the browser after changes.

## Project structure

```text
js/
  app.js                    Application orchestrator
  components/               Navigation, countdown, attendance and trailer
  components/match/         Match, tabs, pitch, player cards and detail dialog
  services/                 Supabase access and concurrent team loading
  validation/               Pure manifest, team and player validation
teams/
  index.json                Ordered team manifest
  team-a.json ...           One independent data file per team
```

The browser loads `js/app.js` as the only module entry point. Components do not
query the page when imported: their initializers receive their roots and options
explicitly, and return cleanup functions for their listeners and timers.

## Editing teams

Each file in `teams/` contains `id`, `name` and a non-empty `players` array. A
player has this shape:

```json
{
  "name": "Jugador A1",
  "position": "DC",
  "rating": 90,
  "x": 50,
  "y": 15,
  "image": "assets/players/player-placeholder.svg",
  "description": "Atacante vertical que destaca por su velocidad y definición.",
  "stats": { "PAC": 92, "SHO": 94, "PAS": 83 }
}
```

Coordinates `x` and `y` are percentages from 0 to 100. Statistics must be
numeric; the card and detail dialog display the first six in the order written
in the JSON. The detail dialog represents them as horizontal bars on a 0–100
visual scale; values outside that range remain visible as text while the bar is
clamped to the scale. Its lateral arrows and the keyboard left/right arrows
cycle through the players of the selected team. `image` is a path relative to
the site root and `description` is the detailed text displayed when the player
card is activated. Both fields are required. Replace the shared placeholder
path with each real player photo when it becomes available.

To add another team:

1. Copy one team file and give it a unique `id`, display `name` and player data.
2. Save it in `teams/` with a lowercase kebab-case `.json` filename.
3. Add that filename to the ordered `teams` array in `teams/index.json`.

Team files load concurrently. If one is invalid or unavailable, the valid teams
remain usable and Partido displays an accessible warning.

## Attendance counter

The hero attendance counter uses Supabase from the static frontend.

1. Run `supabase-attendance.sql` in the Supabase SQL editor.
2. In GitHub, add repository secrets named `SUPABASE_URL` and
   `SUPABASE_ANON_KEY`.
3. GitHub Actions generates `config.js` during the Pages deploy.

For local development, copy `config.example.js` to `config.js` and fill the same
public values. `config.js` is ignored by Git.

These values are injected through GitHub Secrets, but they are still published
to the browser as part of the static site. That is fine for the Supabase anon
key with proper RLS/RPC policies. Never put a Supabase `service_role` key in
this static site.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys this static site on pushes
to `master`. In GitHub, set Pages source to GitHub Actions if it is not already
enabled.
