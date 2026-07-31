# PoE Labyrinth Gem Crafting Analyzer

Static dashboard for comparing Path of Exile Labyrinth Transfiguration crafts using current poe.ninja Skill Gem prices.

The app reports:

- expected profit for random same-colour Transfigures;
- the most profitable base gems for the random Transfigure craft;
- sortable input cost, expected outcome, and expected-profit values.

## Run locally

```bash
npm install
npm run dev
```

The production build is created with `npm run build`. GitHub Pages deployment is handled by `.github/workflows/pages.yml`.

Prices are fetched in the browser through the public poe.ninja API and a public CORS proxy. Values are estimates and can change quickly.

This tool is not affiliated with or endorsed by Grinding Gear Games.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
