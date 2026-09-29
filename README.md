# Contributor Hub

A static, single-page contributor portal for Cioré. The site includes an access gate, a request-access flow, and an internal hub experience for approved contributors.

## Overview

This project is a lightweight front-end app built with plain HTML, CSS, and JavaScript. It is designed to serve as a private contributor portal with:

- an access gate protected by a code entry flow
- a request access form for new contributors
- a multi-page contributor experience within a single-page app structure
- branded landing content and internal resource sections
- Google Apps Script endpoints for form and authentication-related submissions

## Project structure

- `index.html` — main page structure and content
- `styles.css` — all styling and layout rules
- `script.js` — page routing, app logic, access flow, and form handling

## Features

- Secure-style access screen for approved users
- Request access modal with validation and success state
- Internal app layout with logout state
- Single-page navigation using hash-based routes
- Responsive design for desktop and mobile viewing
- Google Apps Script integration for access and submission workflows

## Local development

Because this is a static website, you can run it locally in a few simple ways:

### Option 1: open directly in a browser

Open `index.html` in your browser.

### Option 2: use a local web server

From the project root, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes

- The app expects a valid access code to unlock the internal hub experience.
- The request access and submission flows are connected to external Google Apps Script endpoints configured in the JavaScript.
- The site is intended for internal or approved-use access and includes confidential-resource messaging.

## Deployment

This project can be deployed as a static site on any simple web host or static hosting provider, such as GitHub Pages, Netlify, or Cloudflare Pages.

## License

This project is currently intended for internal use and is not publicly licensed by default. Please confirm ownership and usage restrictions before sharing it beyond the approved project team.
