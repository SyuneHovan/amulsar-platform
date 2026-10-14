# Telegram բոտի կարգավորում

Բոտ՝ @AmulsarContentBot։ Գործարկվում է Vercel Serverless Function-ով՝ \`/api/telegram\` հասցեում։

## 1. Vercel → Project → Settings → Environment Variables

Ավելացնել հետևյալ գաղտնի փոփոխականները **Production** միջավայրում.

- \`TELEGRAM_BOT_TOKEN\` — BotFather-ի տված գաղտնի token-ը։
- \`TELEGRAM_WEBHOOK_SECRET\` — պատահական գաղտնի տող՝ միայն տառեր, թվեր, _ կամ - (օր.՝ 32+ նիշ)։
- \`TELEGRAM_ADMIN_IDS\` — ադմինի Telegram թվային ID-ն։
- \`TELEGRAM_EDITOR_IDS\` — խմբագիրների Telegram թվային ID-ները, ստորակետով բաժանված։
- \`GITHUB_TOKEN\` — fine-grained GitHub token՝ **միայն** \`SyuneHovan/amulsar-platform\` repository-ի **Contents: Read and write** իրավունքով։
- \`GITHUB_REPO\` — \`SyuneHovan/amulsar-platform\` (կարելի է չսահմանել)։

⚠️ Token-ները երբեք մի տեղադրեք GitHub ֆայլերում կամ Telegram-ի հրապարակային խմբերում։

Փոփոխականներն ավելացնելուց հետո **Redeploy** անել Vercel-ում։

## 2. Telegram webhook

Վերջնական հրապարակված հասցեով կանչել՝

\`\`\`bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://amulsar-platform-sable.vercel.app/api/telegram","secret_token":"<TELEGRAM_WEBHOOK_SECRET>","allowed_updates":["message"]}'
\`\`\`

Եթե պատասխանն ունի \`"ok":true\`, webhook-ը գրանցված է։ Սա պետք է անել մեկ անգամ կամ հասցեն փոխելիս։ Token-ը URL-ում գաղտնի է. մի հրապարակեք հրամանի պատմությունը կամ սքրինշոթները։

## 3. Օգտագործում

Բոտին ուղարկել \`/id\`՝ Telegram ID-ն ստանալու համար։ Դրանից հետո ադմինը ID-ն ավելացնում է Vercel-ի \`TELEGRAM_EDITOR_IDS\` ցուցակին և redeploy անում։

- \`/news\` → բոտը ուղարկում է լրացման ձևանմուշ։
- \`/event\` → միջոցառման ձևանմուշ։
- \`/document\` → փաստաթղթի ձևանմուշ։

Լրացված ձևանմուշը մեկ հաղորդագրությամբ ուղարկելուց հետո նյութը **անմիջապես հրապարակվում է**, առանց երկրորդ հաստատման։ Նորությունները և միջոցառումները պահանջում են https սկզբնաղբյուր։ Կայքի թարմացումը կատարվում է GitHub commit → Vercel deploy շղթայով։

**Այս MVP-ում** խմբագիրների ավելացումը կատարվում է Vercel Environment Variables-ով։ Նյութերի խմբագրում, ջնջում, նկարներ և հաստատման քայլ դեռ չեն իրականացվել։ Օգտագործեք միայն բոտի մասնավոր չատը, ոչ խմբային չատերը։
