# Allure Pools Service & Repair — Website

A complete, production-ready, fully static multi-page website for **Allure Pools Service & Repair** (Henderson / Las Vegas, NV). No frameworks, no build step — just open `index.html`.

## Business

- **Owner:** Douglas M. Nandi — 20+ years experience
- **Phone:** [702-483-8424](tel:+17024838424)
- **Email:** allurepools@gmail.com
- **Hours:** Mon–Fri, 8:00 AM – 5:00 PM
- **Service Areas:** Henderson, Las Vegas, Boulder City, Summerlin

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, trust bar, services preview, reviews, referral, about teaser |
| `services.html` | Full service list with pricing |
| `about.html` | About Douglas Nandi + values |
| `reviews.html` | Customer review grid + Google review CTA |
| `contact.html` | Contact form, info cards, referral callout, service-area map |
| `styles.css` | Complete design system (navy + gold, mobile-first) |
| `main.js` | Mobile nav, scroll header, scroll reveal, smooth anchors, form handler |

## Tech

- Hand-written semantic HTML5
- Mobile-first responsive CSS (breakpoints at 640px / 900px / 1200px)
- Vanilla JS (no dependencies)
- Google Fonts: Cormorant Garamond (headings) + Montserrat (body)
- Real brand logo loaded from `assets/logo.png` in every header/footer

## ⚠️ One step to finish branding

Save the Allure Pools logo image into the `assets/` folder as **`logo.png`**
(see `assets/PLACE-LOGO-HERE.txt`). Until then, the header/footer show the
image's alt text instead of the logo.

## Local preview

Just open `index.html` in a browser, or serve the folder:

```bash
# Python
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repository.
2. In the repo: **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch**, Branch: **main** / `/ (root)`, Save.
4. Your site goes live at `https://<username>.github.io/<repo>/`.

## Before going live — replace placeholders

- [ ] Swap Unsplash placeholder images for real photos (Douglas + real pools). Keep the descriptive `alt` text accurate.
- [ ] Update the Google review link (currently a search URL) with the real Google Business "write a review" link.
- [ ] Update canonical / Open Graph URLs (currently `https://allurepools.com/...`) to the real domain.
- [ ] Wire the contact form to a real backend (Formspree, Netlify Forms, etc.) — it currently shows a confirmation message only.
- [ ] Confirm the mailing address and map location.

---

© 2025 Allure Pools Service & Repair · Henderson, NV
