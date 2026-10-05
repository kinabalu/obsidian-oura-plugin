# Oura Ring 0.2.8

- Renames the command to "Insert daily stats" (the command ID is unchanged, so existing hotkeys keep working).
- Rewrites the plugin description for the community plugin directory.
- Uses Obsidian setting headings for the Connection and Templates sections.
- Plugin setup no longer blocks Obsidian startup, stops cleanly if the plugin is disabled mid-load, and shows a notice if settings fail to load. The startup console message is removed.
- Textarea resizing uses popout-window-safe APIs.
- Release assets are limited to main.js, manifest.json, and styles.css, with GitHub build provenance attestations.
- Updates development tooling dependencies flagged by npm audit; no runtime dependency changes.

Minimum Obsidian version is unchanged at 1.5.12.

Validation: automated authentication tests, TypeScript checks, the production build, version consistency, and a security review of the authentication code with no findings. Live Oura sign-in, browser handoff, mobile behavior, and rendered settings have not yet been verified.
