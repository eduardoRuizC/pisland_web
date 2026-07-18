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

Run the dependency-free Node tests with:

```bash
node --experimental-default-type=module --test tests/*.test.js
```

Development notes:

- Edit page structure in `index.html`.
- Edit visual styles and responsive behavior in `styles.css`.
- Edit application behavior in the modules under `js/`.
- Edit news content and ordering in `news/`.
- Edit team names, players, photos, descriptions, positions and statistics in `teams/`.
- Keep static assets in `assets/` and reference them with relative paths.
- There is no compile step; refresh the browser after changes.

## Project structure

```text
js/
  app.js                    Application orchestrator
  components/               Navigation, news, countdown, attendance and trailer
  components/match/         Match, tabs, pitch, player cards and detail dialog
  services/                 Supabase access and concurrent JSON loading
  validation/               Pure news, manifest, team and player validation
dialogs/
  welcome-v1.html           Original welcome dialog version
  partido-v1.html           Partido section announcement version
  equipos-v1.html           Team reveal video announcement version
  capitan-*-v1.html         One daily captain announcement per team
  jugadores-v1.html         Four-player announcement template
news/
  index.json                Ordered news manifest
  alineaciones.json ...     One independent data file per news item
teams/
  index.json                Ordered team manifest
  rompediscotecas.json ...  One independent data file per team
```

The browser loads `js/app.js` as the only module entry point. Components do not
query the page when imported: their initializers receive their roots and options
explicitly, and return cleanup functions for their listeners and timers.

## Publishing dialogs and captain announcements

`index.html` selects the welcome dialog version through its host:

```html
<div
  data-trailer-modal-host
  data-dialog-src="dialogs/capitan-rompediscotecas-v1.html?v=2"
></div>
```

The four captain announcements are published manually, one per day, in the
same order as `teams/index.json`:

1. `capitan-rompediscotecas-v1.html` — Jugador A1
2. `capitan-gargolas-v1.html` — Jugador C1
3. `capitan-bichotas-v1.html` — Genesis
4. `capitan-sangre-nueva-v1.html` — Jugador D1

To publish the next announcement, change only `data-dialog-src` in `index.html`
to the corresponding file with the `?v=2` cache version. The selected version
is loaded asynchronously on each page load and then opened automatically. If
the file is missing or invalid, the rest of the page remains usable and a
descriptive error is written to the browser console.

Each captain dialog includes a vertical 9:16 YouTube Short placeholder. To add
the final video, set the iframe `src` to
`https://www.youtube-nocookie.com/embed/SHORT_ID` and remove its
`tabindex="-1"`. The placeholder is hidden automatically as soon as the iframe
has a `src` attribute. Increment the dialog query version in `index.html` when
editing the currently published dialog.

`dialogs/jugadores-v1.html` is the reusable announcement for player drops. It
contains one editable `data-player-slot` for each team, in the same order as
`teams/index.json`. Each `data-player-image` uses the player's transparent
`fieldImage`; if that resource cannot be loaded, the dialog replaces it with
`assets/player-card-template.png`. Keep the team ID on `data-player-slot`
unchanged. Activate the completed announcement by setting the host's
`data-dialog-src` to `dialogs/jugadores-v1.html?v=4`. This is the version
currently selected in `index.html`.

Captain CTAs use shareable links in the format
`?team=team-a#partido`. Valid team IDs are `team-a`, `team-b`, `team-c` and
`team-d`. A valid ID selects that team's tab after the manifest loads. An
unknown ID leaves the first valid team selected. Opening a Partido deep link
does not display the daily announcement over the requested lineup.

Each version must contain exactly one root
`<dialog data-trailer-modal>` element. It must define `aria-labelledby` with the
ID of a non-empty heading inside the dialog and include at least one control
with `data-close-trailer-modal`. Use `data-close-trailer-modal` on any additional
button or link that should close it. Existing controls elsewhere on the page
can reopen it with `data-open-trailer-modal`.

Version files are HTML fragments: do not add `<html>`, `<head>`, `<body>`,
`<style>` or `<script>`. Dialog styles remain in `styles.css`, and its behavior
remains in `js/components/trailer-modal.js`. The path must refer to a local file
served from the same site.

## Editing news

Only the JSON files listed in `news/index.json` are loaded. Their order in the
`news` array is the display order and represents proximity; files left outside
the manifest never appear on the site.

Each news file has this shape:

```json
{
  "id": "alineaciones",
  "title": "Alineaciones",
  "description": "Nueva sección de alineaciones de los equipos e invitados.",
  "label": "Soon",
  "icon": "groups",
  "href": "#partido"
}
```

`id`, `title` and `description` are required. `href` is optional and can be an
internal anchor, a relative link or an HTTP(S) URL. Without it, the card is
informational and is not rendered as a link. File names and IDs use lowercase
letters, numbers and hyphens, and must be unique. `label` is optional and shows
a short highlighted status, such as `Soon`, above the news title. `icon` is
optional and contains a Google Material Symbols name such as `groups`,
`sports_soccer` or `emoji_events`; when omitted, it defaults to `newspaper`.

To add a news item:

1. Create its JSON file inside `news/`.
2. Add the filename to the desired position in the `news` array in
   `news/index.json`.
3. Optionally set its `icon` field to the desired Material Symbols name.

The first item on the first page is featured using the fixed
`assets/player-card-blank.png` image declared in `index.html`. The first page
displays up to three items; later pages display up to four.

## Editing teams

Each file in `teams/` contains `id`, `name`, `logo` and a non-empty `players`
array. `logo` is a required path relative to the site root. For example, the
Rompediscotecas metadata starts with:

```json
{
  "id": "team-a",
  "name": "Rompediscotecas",
  "logo": "assets/teams/rompediscotecas/rompediscotecas-logo.png"
}
```

The logo is displayed in the top-left corner of the pitch and in the summary of
the player detail dialog. A player has this shape:

```json
{
  "name": "Jugador A1",
  "position": "DC",
  "rating": 90,
  "x": 50,
  "y": 15,
  "active": true,
  "captain": true,
  "image": "assets/teams/player-placeholder.svg",
  "detailImage": "assets/teams/player-placeholder.svg",
  "description": "Atacante vertical que destaca por su velocidad y definición.",
  "stats": {
    "VN": 92,
    "PR": 94,
    "CA": 83,
    "MS": 91,
    "UE": 40,
    "PC": 87
  }
}
```

Coordinates `x` and `y` are percentages from 0 to 100. Every player must define
the six numeric statistics `VN` (Visión de la noche), `PR` (Perreocidad), `CA`
(Capacidad de alcohol), `MS` (Misiones secundarias), `UE` (Unión de equipo) and
`PC` (Picardía). They are always displayed in that order, regardless of their
order in the JSON. The current teams use a six-player reduced football formation:
`POR`, two `DFC`, `MI`, `MD` and `DC`, laid out as 1-2-2-1 from the goalkeeper
toward the opponent goal. The detail dialog can represent them as
horizontal bars or as a hexagonal radar chart on a 0–100 visual scale. The field
cards and hexagon use the abbreviations; the bars use the complete names. Values
outside that range remain visible as text while the graphic is clamped to the
scale. Its lateral arrows
and the keyboard left/right arrows
cycle through only the active players of the selected team. Every player must
define `captain` as a boolean and every team must have exactly one player with
`captain: true`. Active captains show a crown above their field card and to the
left of their name in the detail dialog; an inactive captain keeps that crown
hidden until activated. Set `active` to
`false` to keep the card template and player position visible while replacing
its rating, name and statistic values with `?`; the `VN`, `PR`, `CA`, `MS`, `UE`
and `PC` abbreviations remain visible. The card becomes non-interactive and its detail remains
unavailable. `fieldImage` and `detailImage` are paths relative to the site root:
`fieldImage` is used in the pitch card, and `detailImage` is used in the player
detail dialog. `description` is the detailed text displayed when the player card
is activated.

`description`, `active` and `captain` are required. `fieldImage` and `detailImage` are
optional strings: active players with a real `fieldImage` path use it in the
field card, while inactive players, empty field image values and the shared
placeholder path keep the original card template in the field view. The dialog
uses `detailImage` when it is available and shows its visual fallback otherwise.
Replace the shared placeholder path with each real player photo when it becomes
available.

To add another team:

1. Copy one team file and give it a unique `id`, display `name`, `logo` path and
   player data.
2. Save its logo in `assets/teams/<team-slug>/` and its data in `teams/` with a
   lowercase kebab-case `.json` filename.
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

GitHub Pages is published from `master` through two workflows:

- `Deploy GitHub Pages - Scheduled` publishes every day at 14:05 in the
  `Europe/Madrid` timezone, through July 25, 2026 (inclusive).
- `Deploy GitHub Pages - Manual Fix` can be started from the Actions tab with
  **Run workflow** to publish an urgent fix. It only deploys when `master` is
  selected.

Pushing to `master` does not deploy immediately. Changes remain pending until
the next scheduled deployment or a manual fix deployment. The manual workflow
continues to work after the scheduled deployment window ends.

In GitHub, set Pages source to GitHub Actions if it is not already enabled.
