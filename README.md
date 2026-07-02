# pisland_web

Static GitHub Pages site for Pisland Festival - Home (Full Background Josh).

## Local development

This is a static GitHub Pages site. It does not require Node.js, a package
manager, or a build step.

Requirements:

- A modern browser.
- Python 3, only if you want to run a local static server.

Start the site locally:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

You can also open `index.html` directly in a browser, but using a local server is
closer to how GitHub Pages serves the site.

Development notes:

- Edit page structure in `index.html`.
- Edit visual styles and responsive behavior in `styles.css`.
- Edit small interactions, such as the countdown, modal, and nav state, in
  `script.js`.
- Keep static assets in `assets/` and reference them with relative paths.
- There is no compile step; refresh the browser after changes.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys this static site on pushes
to `master`. In GitHub, set Pages source to GitHub Actions if it is not already
enabled.
