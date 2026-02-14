# 🔄 Encoding/Decoding Tool

A simple web tool for encoding and decoding text in various formats. No fluff, just gets the job done.

## ✨ What it does

Convert text between different encoding formats:
- **Base64** - encode/decode text or files
- **Base62** - compact alphanumeric encoding for text
- **URL encoding** - handle those pesky special characters in URLs
- **XML entities** - convert special characters to XML-safe format

## 🚀 Features

- **Dark/Light theme** - because your eyes matter
- **File upload** - drag & drop files for Base64 encoding
- **Real-time conversion** - see results as you type
- **Copy to clipboard** - one-click copying
- **URL sharing** - share encoded text via URL parameters
- **No data collection** - everything happens in your browser

## 💡 Usage

1. Open `index.html` in your browser
2. Pick your encoding format from the dropdown
3. Type or paste your text (or upload a file for Base64)
4. Hit encode/decode
5. Copy the result

That's it! 

## 🛠️ Tech Stack

- Vanilla JavaScript (no fancy frameworks needed)
- Bootstrap 5 for styling
- Local storage for theme preferences

## 🧩 Cache-busting rule

- `index.html` and `libs/encoding` must both load `app.js` with the same `?v=...` query.
- Whenever `app.js` changes, bump the version string in both files.

## 🌐 Live Demo

Check it out at: [encoding.sanjaysingh.net](https://encoding.sanjaysingh.net)

---

*Simple tools for simple tasks* ⚡
