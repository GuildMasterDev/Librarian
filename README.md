# Librarian — Personal Library Manager

A personal library manager for home readers. Track what you're reading,
keep notes, rate finished books, and organize your collection. Works as
a desktop app (Electron + SQLite) or as a web / PWA demo (vanilla JS +
localStorage).

**App ID**: `me.davidcanhelp.librarian`
**Version**: 2.0.0
**Platforms**: macOS, Windows, Linux (desktop) · any modern browser (web / PWA)

## Live demo

👉 **<https://guildmasterdev.github.io/Librarian>**

The web demo is a single-file app: no server, no account, no tracking.
Your library lives in your browser's `localStorage`. You can also
install it as a PWA for offline use.

## Features

- Add, edit, and delete books
- ISBN auto-lookup via Open Library and Google Books
- Reading-status tracking (unread / reading / completed / incomplete)
- Reading-progress bar with current page / total pages
- Favorites with a dedicated filter
- Ratings (1–5 stars) for completed books
- Per-book notes
- Search across title, author, genre, and notes
- Import / export of your library as JSON (web version)
- Cover images fetched automatically when available

## Web demo vs. desktop app

|                       | Web / PWA demo                    | Desktop app (Electron)        |
| --------------------- | --------------------------------- | ----------------------------- |
| Storage               | Browser `localStorage` (~5 MB)    | SQLite in user data directory |
| Install               | Add to Home Screen / Install PWA  | Installable binary (dmg/exe)  |
| Offline               | Yes (via service worker)          | Yes (local)                   |
| Sync across devices   | No — data stays in one browser    | No — data stays on one device |
| Backup                | Built-in JSON export / import     | Copy the `.db` file           |

Same UI, same features. The desktop app is better when you have a large
library or want unlimited storage; the web demo is ideal for trying it
out or for lightweight use.

## Installing the PWA

1. Open <https://guildmasterdev.github.io/Librarian> in Chrome, Edge, or Safari.
2. Click **Install** in the address bar (desktop) or **Add to Home Screen**
   (iOS/Android).
3. Launch from your dock / home screen — it runs in a standalone window
   and works offline after the first load.

## Running the desktop app

```bash
git clone git@github.com:GuildMasterDev/Librarian.git
cd Librarian
npm install
npm run dev          # development
npm start            # production
```

If you bump Electron or change platforms, rebuild the native binding:

```bash
npm rebuild sqlite3
```

### Building distributables

```bash
npm run dist         # current platform
npm run dist-mac     # macOS (dmg + zip, x64 + arm64)
npm run dist-win     # Windows (nsis + portable)
npm run dist-linux   # Linux (AppImage + deb)
```

Output lands in `dist/`.

### Generating icons (optional)

Icons ship pre-generated in `assets/`. If you change the base icon, run:

```bash
./generate-icon.sh   # requires ImageMagick
```

## Keyboard shortcuts

| Shortcut                     | Action                     |
| ---------------------------- | -------------------------- |
| `Cmd/Ctrl + N`               | Add new book               |
| `Cmd/Ctrl + F`               | Focus search field         |
| `Cmd/Ctrl + R`               | Reload application (desktop) |
| `Alt + Cmd/Ctrl + I`         | Toggle DevTools (desktop)  |

## Project layout

```
Librarian/
├── main.js               # Electron main process
├── preload.js            # contextBridge API
├── renderer.js           # desktop UI logic
├── index.html            # desktop UI
├── styles.css            # desktop styles
├── database.js           # SQLite adapter
├── bookAPI.js            # Open Library + Google Books wrapper
├── assets/               # app icons
├── web/                  # self-contained web demo / PWA
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
└── .github/workflows/    # CI + Pages deploy
```

## Tech stack

- **Electron 41** — cross-platform desktop shell
- **SQLite3 6** — local database for the desktop app
- **Axios 1.15** — HTTP client in the desktop app
- **Vanilla JS + CSS** — no frameworks in the web demo
- **Service Worker + Web App Manifest** — PWA installability
- **Open Library + Google Books APIs** — metadata and covers

## License

MIT
