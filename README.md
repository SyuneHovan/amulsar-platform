# Ամուլսար — հանրային տեղեկատվական հարթակ

React + Vite կայք՝ առանց backend-ի։ Տվյալները պահվում են JSON ֆայլերում։

## Գործարկել

```bash
npm install
npm run dev
```

## Թարմացնել բովանդակությունը

- `src/data/news.json` — նորություններ
- `src/data/events.json` — միջոցառումներ
- `src/data/articles.json` — հոդվածներ
- `src/data/documents.json` — փաստաթղթեր
- `src/data/locations.json` — քարտեզի կետեր

Նորությունների դաշտեր՝ `id`, `title`, `date` (YYYY-MM-DD), `summary`, `sourceUrl`։ Միջոցառումների դաշտեր՝ `id`, `title`, `date`, `time`, `location`, `description`, `sourceUrl`։

## Vercel

Import Git Repository → Framework: Vite → Build: `npm run build` → Output: `dist`։

Քարտեզի նշումները մոտավոր են, իսկ լուրերի և միջոցառումների JSON-ները սկզբում դատարկ են՝ չստուգված տեղեկություն չհրապարակելու համար։
