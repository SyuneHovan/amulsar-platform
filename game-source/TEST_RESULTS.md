# Current revision — Doodle reference profile (2026-10-23)

Chromium 153.0.8010.0. **45/45 checks passed**, plus the flower/damage feedback checks. No uncaught JavaScript errors were recorded in the current regression, extra and reference suites.

- `regression.cjs`: 18/18 (touch, layouts, save/restore, pause, restart, storage failures).
- `extra.cjs`: 6/6 (keyboard, multitouch, real animation loop, moving collision, desktop sizing, quiz).
- `campaign-mechanics.cjs`: 10/10 (four stations, 1280 main ledges, 96 objects, hazards, special ledges, deep save, legacy migration).
- `pacing.cjs`: 6/6 (reference bounce, interrupted-stream regression, no long fixed-column climb, timer and restore).
- `reference-feel.cjs`: 5/5 (all route steps reachable, varied field, 1.25 s return, camera, four synthetic station fixtures).
- `flower-feedback.cjs`: flower shield remains visible without hurt flashing; damage and restart feedback pass.

Measured apex: **205.664 units after 0.625 seconds**. Return to take-off height: **1.25 seconds**. Longest fixed-column run: 8 adjacent main rows; a passive opening run stopped making progress around altitude 1254, within the first chapter.

Current route and exact calibration: `DOODLE_REFERENCE.md`. Synthetic station fixtures validate transitions and time displays; they do not demonstrate earning the collectibles. The historical greedy whole-campaign pilot does not reliably complete this new scattered profile. A full 96-collectible playthrough remains unverified.

---

# Historical report for the previous short-hop revision

# Վերադարձրու Ամուլսարը — երկար, շարունակական տարբերակ

Փորձարկման ամսաթիվ՝ 2026-10-23։ Բրաուզեր՝ Chromium 153.0.8010.0՝ Playwright-ով։

Արդյունք՝ **4/4 գլուխ ավարտված, յուրաքանչյուրում՝ 24/24 հետք, ընդհանուր՝ 96 հետք։ 44/44 լրացուցիչ ստուգում անցած։ Չմշակված JavaScript սխալ՝ 0։**

## Խաղի ծավալն ու ֆիզիկան

- 320 հիմնական հարթակ յուրաքանչյուր գլխում՝ ընդհանուր 1280, հավելյալ ապահով այլընտրանքներով։ Նախորդ տարբերակում մոտ 38 հիմնական հարթակ կար յուրաքանչյուր գլխում։
- Ցատկի արագությունը դանդաղեցված է 18%-ով՝ պահպանելով նախորդ բարձրությունը։ Սովորական ցատկի չափված բարձրությունը՝ 96.72 խաղային միավոր, նախորդի մոտ 230–240-ի փոխարեն։ Բարձրությունը մոտ 2.4 անգամ նվազեցված է։
- Հարթակների քայլը 54–72 միավոր է։ Սովորական ցատկը հիմնականում տանում է հաջորդ հարթակին։
- Հրթիռն ու զսպանակը նույնպես սահմանափակված են․ երկար բարձրացում չեն առաջացնում։
- Բոլոր չորս գլուխների ավտոմատ խաղարկումն օգտագործել է մոտ 16.0 րոպե խաղային ժամանակ՝ առանց հարցերի ընթերցման ժամանակի։ Սա սիմուլյացիայի ժամանակն է, ոչ թե իրական սարքի արագաչափում կամ յուրաքանչյուր խաղացողի տևողության խոստում։

## Ժամանակ և ճանապարհ

Ամեն գլխում կա ընթացիկ ժամաչափ։ Դադարը և հարցերը չեն ավելացնում խաղային ժամանակը։ Կայանում երևում է տվյալ գլխի ժամանակը, ավարտին՝ բոլոր չորսը և ընդհանուր ժամանակը։ Առաջատարների աղյուսակ չի ավելացվել։ Հարթակները հերթական աջ/ձախ թռիչքներ են պահանջում։ Կաթիլները հասնում են իրենց անկման վերջնակետին, ապա դադարից հետո սկսում հաջորդ ցիկլը։

## Անընդհատ անցումներ

Յուրաքանչյուր կայանում հարցից առաջ և շարունակելուց հետո համեմատվել են կերպարի բարձրությունը, տեսախցիկը, ֆիզիկայի ժամանակը, աշխարհի հարթակների քանակը և հաշիվը։ Առաջին երեք անցումների ժամանակ դրանք չեն վերակայվել։ Հարցից հետո չի բացվում նոր գլխի ներածություն կամ առանձին ավարտի պատուհան․ կերպարը շարունակում է նույն լեռան վրա։

Վերջին կայանն ավարտում է պատմությունը՝ «Դու փրկեցիր Ամուլսարը» պատուհանով։ Հաշիվն ընդհանուր է ամբողջ վերելքի համար։ Նախորդ կայաններում ամրագրված հաշիվը պահպանվում է նաև ընթացիկ գլխի նոր փորձից հետո։

## Միջավայրը և վտանգները

Սկիզբը ներկայացնում է պայմանական ավերված հանք՝ ժանգոտ կառույցներով, թունավորված հոսքերով և չոր լանջով։ Ֆոնի տեսանելիությունն ավելացված է՝ նախորդ մոտ 13%-ից մոտ 27%-ի։ Այն պահպանում է մեղմ հակադրությունն ու ազատ կենտրոնական տարածքը։ Գլուխների և տեսարանների անցումը կատարվում է աստիճանական խառնմամբ՝ առանց պատկերի կտրուկ փոխվելու։ Վերջում լեռը կանաչում և ծաղկում է։

Նոր վտանգներ՝ թթվային կաթիլներ, թթվային հոսքեր, արտահոսող տարաներ, պարբերական արտանետումներ, քարաթափում և փոշու ամպեր։ Կան քայքայվող ու անհետացող հարթակներ։ Բոլոր անհետացող հարթակների կողքին ստուգվել է պինդ այլընտրանքի առկայությունը։ Վերջին գլխի վերջնամասում վտանգները նահանջում են։

Ծաղիկի պաշտպանությունը չի թարթեցնում կերպարին․ թարթումը շարունակում է պատկանել միայն իրական վնասի արձագանքին։

## Ամբողջական խաղարկում

Փորձարկիչը կառավարել է ուղղությունը և առաջ տարել նույն ֆիզիկան։ Ամբողջական խաղարկման ընթացքում կերպարի դիրքը ուղղակի չի փոխվել, իսկ առարկաները հարկադրաբար չեն հավաքվել։ Բաց թողած առարկաների դեպքում օգտագործվել է խաղի վերադարձի գործողությունը։

| Գլուխ | Վերջնական հավաքած | Մնացած կյանք | Կայանը ավարտված |
|---|---:|---:|---|
| 1. Ջրի ճանապարհը | 24/24 | 3 | Այո |
| 2. Ցիանիդի հետքը | 24/24 | 3 | Այո |
| 3. Փոշու ամպերը | 24/24 | 3 | Այո |
| 4. Լեռան ապագան | 24/24 | 3 | Այո |

## Կրկնակի և մեկուսացված ստուգումներ

- Անցած՝ Six selectable skins and saved selection։
- Անցած՝ First chapter unlocked; later chapters locked։
- Անցած՝ Native touch right, cancel, and drag across canvas։
- Անցած՝ Pause freezes physics and reset inputs։
- Անցած՝ Run snapshot survives reload։
- Անցած՝ Restart restores initial chapter state։
- Անցած՝ Fall, game over, retry։
- Անցած՝ Corrupt run falls back to menu with explanation։
- Անցած՝ Invalid legacy save is sanitized։
- Անցած՝ Storage blocked: game still starts։
- Անցած՝ Asset-load error has a retry action։
- Անցած՝ Journal includes sources and no measured Amulsar allegation։
- Անցած՝ Layout 320x568։
- Անցած՝ Layout 360x800։
- Անցած՝ Layout 390x844։
- Անցած՝ Layout 412x915։
- Անցած՝ Layout 844x390։
- Անցած՝ Layout 1280x800։
- Անցած՝ Keyboard after Start focuses game correctly։
- Անցած՝ Multi-touch releases independently։
- Անցած՝ Real requestAnimationFrame loop advances without test mode։
- Անցած՝ Swept collision with moving ledge։
- Անցած՝ Desktop canvas uses container size։
- Անցած՝ Wrong quiz answer explains and permits progression։
- Անցած՝ 1280 route ledges, four stations and 96 required traces։
- Անցած՝ Normal jump apex below 110 game units։
- Անցած՝ Visible vanishing ledge supports a landing։
- Անցած՝ Absent vanishing ledge can be fallen through։
- Անցած՝ Corroded ledge breaks on landing with a solid alternate ledge։
- Անցած՝ All vanishing ledges have solid alternatives։
- Անցած՝ All seven themed hazard variants are present։
- Անցած՝ Legacy progress resumes at the corresponding longer chapter։
- Անցած՝ Deep campaign save restores below the former height limit։
- Անցած՝ Retry retains the score banked at earlier stations։
- Անցած՝ Slower ascent retains the previous jump range։
- Անցած՝ No fixed horizontal column offers a long automatic climb։
- Անցած՝ Streams never jump backwards during an active fall։
- Անցած՝ A passive player cannot clear the opening route։
- Անցած՝ Timer advances during gameplay and stops during pause։
- Անցած՝ Elapsed stage time survives reload։
- Անցած՝ Flower pickup grants shield without hurt flash։
- Անցած՝ Hero drawn continuously across 12 animation frames after pickup։
- Անցած՝ Real damage triggers hurt flash։
- Անցած՝ Restart clears hurt flash։

Ստուգված են 320×568, 360×800, 390×844, 412×915, 844×390 և 1280×800 դասավորությունները, native touch, touchCancel, երկու մատով կառավարումը, ստեղնաշարը, դադարը, նոր փորձը և իրական requestAnimationFrame ցիկլը։

Անհետացող հարթակը տեսանելի փուլում պահել է կերպարին, իսկ անհետացած փուլում թույլ է տվել անցնել միջով։ Քայքայվող հարթակը կոտրվել է վայրէջքից հետո։ Առկա են յոթ թեմատիկ վտանգների տեսակները։

Ստուգվել են խոր բարձրության պահպանումը, վնասված պահպանման մշակումը, արգելափակված localStorage-ի դեպքում խաղալը և հին տարբերակի առաջընթացի տեղափոխումը համապատասխան նոր գլխի սկզբին։ Բացված գլուխներն ու կերպարը պահպանվում են, հին կարճ քարտեզի դիրքերը չեն կիրառվում նոր քարտեզին։

Մեկուսացված ստուգումներում օգտագործվել են արհեստական պահպանված վիճակներ։ Ամբողջական խաղարկման ստուգումը նման տեղափոխում չի օգտագործել։

## Փաստական բովանդակություն

Խաղի չորս հարցերն ու հիմնական գիտական բացատրությունները պահպանված են։ Սցենարը, թունավոր ավերակների պատկերը և փրկության ավարտը խորհրդանշական են։ Դրանք Ամուլսարում չափված կոնկրետ արտահոսքի, իրական աղտոտման աստիճանի կամ փաստացի վերականգնման հաստատում չեն։

Սկզբնաղբյուրները հասանելի են խաղի օրագրից․

- [US EPA — Abandoned Mine Drainage](https://www.epa.gov/nps/abandoned-mine-drainage)
- [USGS — Cyanide hazards to plants and animals from gold mining](https://www.usgs.gov/publications/cyanide-hazards-plants-and-animals-gold-mining-and-related-water-issues)
- [NSW Health — Mine dust and you](https://www.health.nsw.gov.au/environment/factsheets/Pages/mine-dust-and-you.aspx)

## Մնացած սահմանափակումներ

Խաղի ավարտը խափանող հաստատված խնդիր այս ստուգումներում չի մնացել։

- Իրական Android սարքի GPU-ն, մարտկոցը, երկարատև ջերմացումը և արտադրողականությունը չեն չափվել։ Ստուգվել է Chromium-ը՝ բջջային չափերով և հպումներով։
- Safari, Firefox և iOS առանձին չեն փորձարկվել։
- Սարքի native «Կիսվել» պատուհանը չի բացվել։
- Պահպանումը կախված է տվյալ դիտարկիչի localStorage-ից և նույն հասցեից/տեղային միջավայրից։
- Մարդկանց տարբեր հմտությունների խմբերով բարդության երկարատև գնահատում չի կատարվել։ Բարդությունը բարձրացված է, և փորձարկիչը նույնպես կարող է բաց թողնել առարկա՝ վերադառնալով դրա մոտ։

## Վերարտադրելի տվյալներ

`tests/campaign-journey-result.json`, `tests/campaign-mechanics-result.json`, `tests/regression-result.json`, `tests/extra-result.json`, `tests/flower-feedback-result.json`։ Գործարկման հրահանգները՝ `README.md`։

HTML-ի չափը՝ 3,287,865 բայթ։ SHA-256՝ `6ec80391692188b40e0573689a8fc7661eee0e6b060641cdb4454f0130b0e3a0`։
