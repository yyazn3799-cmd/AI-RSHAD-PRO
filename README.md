# RSHAD AI — New prototype

This is a fresh front-end prototype for the redesigned RSHAD AI concept.

## Included
- Language selection as the first screen (12 language choices).
- Arabic and English interface translations; other language choices currently use English fallback and need full translation before public launch.
- Welcome and intermediary/affiliate disclosure.
- Weekly ($3), monthly ($9), and yearly ($79) plan selection.
- Sham Cash payment identifier field prefilled with the identifier supplied by the project owner.
- Demo-only payment notification form.
- Member service categories and sample third-party directory entries.

## Critical limitations — do not collect real payments with this prototype
1. This is a static front-end only. It does not connect to Sham Cash, verify transfers, upload receipt images, create accounts, or enforce subscription expiry.
2. The demo form opens the member area immediately after submission. This is deliberately only a visual prototype and is not secure payment activation.
3. The payment identifier must be confirmed with Sham Cash and commercial-use/currency rules before real use.
4. The directory entries are examples, not live rankings. No affiliate partnerships are claimed. Add affiliate links only after a real partner agreement, and disclose them.
5. A production release needs a backend, secure admin tools, server-side payment verification, subscription records, privacy/terms pages, and localization review.

## Test locally
Open `index.html` in a modern browser. For best results, serve the folder using a static web server.

## Publish to GitHub Pages
Upload the files in this folder to the repository root, keeping the filenames:
- `index.html`
- `style.css`
- `app.js`
- `manifest.webmanifest`

Then enable GitHub Pages from the repository settings. This prototype does not replace the old project until you choose to publish it.
