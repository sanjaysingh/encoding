# Encode

A small browser tool for encoding and decoding text. No accounts, no uploads, no extra libraries in the page.

## What it does

Convert text between common formats:

- **Base64** — encode or decode text and files
- **Base32** — RFC 4648-style alphanumeric encoding
- **Base62** — compact letters-and-numbers encoding
- **Hexadecimal** — UTF-8 bytes as hex
- **HTML / XML entities** — named and numeric entities
- **URL** — percent-encoding for query values
- **JSON** — escape or unescape JSON string content

## Features

- Dark and light themes, remembered locally
- Real-time conversion as you type
- File input, including drag and drop
- Copy, download, swap, and clear
- Shareable `type` and `mode` URL parameters
- Runs entirely in the browser

## Usage

1. Open `index.html` in a browser
2. Choose a format and Encode or Decode
3. Type, paste, or drop a file
4. Copy or download the result

## Tech

Vanilla HTML, CSS, and JavaScript. Theme and last-used format live in `localStorage`.

## Testing

- **Unit tests** (Vitest): `npm run test`
- **E2E tests** (Playwright): `npm run test:e2e`

CI runs both on every PR and push to `main`.

## Cache-busting rule

- `index.html` and `libs/encoding` must both load `app.js` with the same `?v=...` query.
- Whenever `app.js` changes, bump the version string in both files.

## Live demo

[encoding.sanjaysingh.net](https://encoding.sanjaysingh.net)
