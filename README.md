# Shivam's Apps — Portfolio Website

Single-page portfolio hub for all projects: **Black Browser** (featured), **mtube**, **ytube**, **Black Browser (C#)** and **Electronics Calculator**.

- Dark glassmorphism theme (TailwindCSS via CDN)
- Mobile responsive
- Download buttons auto-fetch the latest GitHub release via the GitHub API — new releases appear automatically
- Linux button shows **"Coming Soon"** until a `.AppImage` asset is published
- 100% free hosting: GitHub Pages

## Files

```
index.html   — the website
assets/      — resized app icons
```

## Deploy to GitHub Pages (free, no credit card)

1. Create a new public repo on GitHub named `black-browser-website`
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/shivamkumarmehta64-sketch/black-browser-website.git
   git push -u origin main
   ```
3. On GitHub: repo → **Settings** → **Pages**
4. Under **Build and deployment** → **Source**: select `Deploy from a branch`
5. Branch: `main` → folder `/ (root)` → **Save**
6. Wait ~1 minute. Site live at:
   ```
   https://shivamkumarmehta64-sketch.github.io/black-browser-website/
   ```
7. (Optional) On the same Settings → Pages page, add a custom domain under **Custom domain** (requires buying a domain + DNS records).

## How downloads auto-update

On page load the site fetches:

- `shivamkumarmehta64-sketch/Black/releases/latest` → Windows button points to the `.exe`
- `shivamkumarmehta64-sketch/mtube/releases/latest` → Download points to `.exe`/`.zip`
- `shivamkumarmehta64-sketch/ytube/releases/latest` → Download points to `.exe`/`.zip`
- `shivamkumarmehta64-sketch/Electronics_Calculator/releases/latest` → `.apk` if present

Publish a new release in any repo → the site button and version badge update automatically. No redeploy needed.

To make the **Linux** button active, attach an `.AppImage` (or `.deb`/`.rpm`) asset to a Black release.

## Notes

- GitHub API is unauthenticated (60 requests/hour per IP) — plenty for a landing page (4 calls per load).
- If the API fails (offline/rate limit), all buttons fall back to the repo releases pages.
- No analytics and no tracking — by design. (GoatCounter free tier can be added later if you want stats.)
