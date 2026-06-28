# Kumar Abhinav — 3D Portfolio    

Preview link: https://3d-photofolio.vercel.app/
A unique, single-page **static 3D portfolio website** built with HTML, Bootstrap 5, custom CSS, and Three.js. Everything is rendered in real-time WebGL — no images required.

## ✨ What makes it unique

- **Animated 3D loader** (rotating cube)
- **Custom 3D cursor** with smooth-follow ring
- **Full-page particle galaxy** background (parallax + scroll reactive)
- **Hero 3D scene** — wireframe icosahedron + metallic orb + orbiting spheres that react to your mouse and scroll
- **3D morphing torus knot** in the About section
- **Skills sphere** — labeled tech tags orbiting an interactive sphere
- **3D timeline** for Education with glowing nodes
- **Tilt-on-hover cards** (vanilla-tilt) for Experience & Projects
- **Glassmorphism UI**, animated gradient typography, GSAP scroll animations, AOS reveals
- **Fully responsive** + reduced-motion support

## 📂 Structure

```
3d-portfolio/
├── index.html          ← all sections (Hero / About / Education / Skills / Experience / Projects / Contact)
├── css/style.css       ← custom theme + 3D effects
├── js/main.js          ← Three.js scenes + GSAP + interactions
└── assets/             ← drop any future images here
```

All libraries (Bootstrap, Three.js, GSAP, AOS, vanilla-tilt, Bootstrap-Icons) load from CDN, so **no build step is required**.

## 🚀 Run it

Because the page uses ES Modules (Three.js via importmap), open it through a tiny local server, not via `file://`.

**Option 1 — Python (built-in on macOS):**
```bash
cd ~/Desktop/3d-portfolio
python3 -m http.server 5173
```
Then open <http://localhost:5173>.

**Option 2 — VS Code:** install the “Live Server” extension and right-click `index.html` → *Open with Live Server*.

**Option 3 — Node:**
```bash
npx serve ~/Desktop/3d-portfolio
```

## ✏️ Where to edit your real info

Open `index.html` and search for `[EDIT]`. You'll find marked spots for:

- Education entries (degree, college, dates) — the timeline section
- Previous work experience card
- Project descriptions / links
- Email + social URLs (GitHub, Twitter, etc.)

The hero already pulls your name **Kumar Abhinav** and current employer **GSPANN Technologies** (the only fields publicly visible on your LinkedIn).

## 🎨 Quick theming

All colors live in CSS variables at the top of `css/style.css`:

```css
--accent-1: #7c5cff;   /* violet */
--accent-2: #00e5ff;   /* cyan   */
--accent-3: #ff5ca7;   /* pink   */
```
Change those three and the entire site re-themes.

## 📨 Make the contact form actually send

The form is wired with a visual “sent” message only. To deliver real emails plug it into a service like:

- [Formspree](https://formspree.io/) — change `<form>` to `<form action="https://formspree.io/f/yourID" method="POST">`
- [EmailJS](https://www.emailjs.com/) — works fully client-side

## 🌐 Deploy

Drag the folder to any of: **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages**, or **Render** static sites. No build command needed — publish directory = root.

---
Built with ❤️ &amp; ☕ — feel free to customize.
