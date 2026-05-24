# Knjiga Čarolija · Harry Potter Spell Book

A static, bilingual (Serbian / English) presentational website themed around the world of Harry Potter. Built as a Web Design project assignment  pure HTML5, CSS3, vanilla JavaScript and Bootstrap 5, no backend or external API.

## Pages

| # | File | Purpose |
|---|------|---------|
| 01 | `index.html` | Home  hero, "how the book works" steps, history of Hogwarts |
| 02 | `spellbook.html` | Interactive catalog  search / filter / sort 30+ spells, click for details modal |
| 03 | `about.html` | Project info  founders timeline, spell anatomy, tech stack, site map |
| 04 | `login.html` | "Great Hall" login  SHA-256 hashing against `users.json` |
| 05 | `contact.html` | "Send an Owl"  contact form with regex validation, tooltips |
| 06 | `success.html` | Owl-flown confirmation with form summary and auto-redirect |

## Features

- **Bilingual**  Serbian (default) and English, language toggle in nav, stored in `localStorage`.
- **Spell book browser**  text search, filter pills (Charms / Curses / Counter-spells), sort by name or difficulty, detail modal.
- **Form validation**  regex patterns for name / email / message, live feedback, focus tooltips.
- **SHA-256 login**  passwords are hashed client-side with `crypto.subtle.digest` and compared against `users.json`.
- **Persistent session**  logged-in user shown as a pill in the navbar across pages.
- **Responsive**  Bootstrap 5 grid; works down to mobile.

## Demo credentials

| Username | Password |
|----------|----------|
| `dumbledore` | `password123` |
| `harry` | `password456` |

## Running locally

Because the site loads `spells.json` and `users.json` over `fetch()`, open it through a local web server (not the `file://` protocol):

```bash
# Python 3
python -m http.server 8000

# Node
npx serve .
```

Then open `http://localhost:8000/`.

## Tech

- HTML5  semantic structure across all pages
- CSS3  CSS variables, custom dark + gold Hogwarts theme
- JavaScript  vanilla, `crypto.subtle`, `fetch`, `sessionStorage` / `localStorage`
- Bootstrap 5  grid system and responsive utilities
- Cinzel + Crimson Text  Google Fonts

## Project structure

```
Harry_Potter_Web/
├── index.html
├── spellbook.html
├── about.html
├── contact.html
├── login.html
├── success.html
├── favicon.svg
├── spells.json
├── users.json
├── css/
│   ├── style.css
│   ├── spellbook.css
│   ├── about.css
│   ├── contact.css
│   └── login.css
└── js/
    ├── i18n.js
    ├── main.js
    ├── spellbook.js
    ├── contacts.js
    └── login.js
```

---

*Draco Dormiens Nunquam Titillandus*
