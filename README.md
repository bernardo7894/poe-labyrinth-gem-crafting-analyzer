# PoE Labyrinth Gem Crafting Analyzer

Static dashboard for comparing Path of Exile Labyrinth gem-crafting options using current poe.ninja Skill Gem prices.

The active trade league is discovered at runtime, so the dashboard follows league launches instead of relying on a hard-coded league name. Market requests use the same Cloudflare Worker proxy as the companion [Volatile Vaal Orb Calculator](https://github.com/bernardo7894/volatile-vaal-orb-calculator) project.

The analyzer includes the four analyses from the original AI Studio project:

- Analysis A: random uncorrupted transfigured gem by colour (`1/0`);
- Analysis B: best base gem for the random transfigured-version craft (`1/0`);
- Analysis C: random corrupted transfigured gem by colour (`21/20` and `21/23`);
- Analysis D: random corrupted ordinary gem by colour (`21/20` and `21/23`).

The dashboard intentionally omits corrupted `1/0` crafts: using a Labyrinth craft on an unlevelled corrupted gem is not a practical strategy.

Support gems and Vaal gems are excluded. For the ordinary-gem input crafts, input cost is treated as `0 c` because ordinary skill gems are available from Lilly; corrupted-gem analyses still subtract the cheapest eligible market input. Hover over expected values or input costs to see the five most relevant prices, and use the sortable headers to reorder results.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`. GitHub Pages deployment is handled by `.github/workflows/pages.yml`.

Prices are fetched in the browser through the public poe.ninja API and a public CORS proxy. Values are estimates and can change quickly.

This tool is not affiliated with or endorsed by Grinding Gear Games.
