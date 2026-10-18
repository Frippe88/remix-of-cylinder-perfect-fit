# Remix of Cylinder Perfect Fit

Bygg en professionell, mobilanpassad svensk webbapp för låssmeder. Appen ska heta Cylinderkalkylatorn och hjälpa användaren att beräkna rätt kombination av cylinderförlängare och cylinderringar.

1. Grundläggande beräkning

Standardcylinderns längd är 31 mm.

Användaren anger avståndet från låshusets referenspunkt till dörrbladets yta.

Stöd enkelcylinder och dubbelcylinder. Vid dubbelcylinder ska utsida och insida beräknas separat.

Tillgängliga förlängare är 8 mm, 10 mm och 12,5 mm.

Tillgängliga ringhöjder är 6, 8, 11, 13, 16, 18 och 21 mm.

Användaren ska kunna markera och avmarkera varje förlängarstorlek och ringhöjd beroende på vad som finns i lager.

En avmarkerad storlek får aldrig förekomma i något beräkningsresultat.

Tillåt flera förlängare av samma storlek. Ha ingen onödig låg gräns för antalet förlängare.

2. Toleranser

Beräkna avvikelsen enligt:

Avvikelse = 31 mm + sammanlagd förlängarlängd − dörrdjup − ringhöjd.

Godkända resultat är från −1 mm till +2 mm.

0 mm betyder exakt i liv med ringen.

Positiv avvikelse betyder att cylindern sticker ut.

Negativ avvikelse betyder att cylindern hamnar innanför ringen.

3. Resultat och alternativ

Visa alltid den bästa rekommendationen och låt användaren välja mellan:

Exakt 0 mm – samtliga kombinationer som ger exakt passform.

Alla godkända alternativ – alla kombinationer inom toleransen.

Färre förlängare – alternativ som använder färre delar, även om avvikelsen blir exempelvis +1 mm.

Visa för varje alternativ ringhöjd, varje förlängares storlek, antal förlängare, sammanlagd förlängning och slutlig avvikelse.

Sortera alternativen så att exakt 0 mm prioriteras, följt av minsta absoluta avvikelse och därefter färre förlängare. Dölj inte alternativa kombinationer som ger samma passform med andra delar.

Om ingen lösning finns ska appen tydligt säga det och föreslå att användaren kontrollerar tillgängliga storlekar eller mätningen.

4. Design

Skapa ett rent, professionellt och lättläst gränssnitt på svenska. Det ska fungera på mobil, surfplatta och dator. Använd tydliga inmatningsfält, kryssrutor för lagerstorlekar och lättjämförda resultatkort.

5. Teknisk kvalitet

Använd en separat, testbar beräkningsfunktion för all matematik. AI får aldrig hitta på eller uppskatta beräkningsresultat. Samma indata ska alltid ge samma resultat. Lägg till automatiska tester för toleranser, saknade storlekar, dubbelcylinder och alternativa kombinationer.

Bygg en fungerande app, inte bara en designprototyp. Börja utan inloggning och databas. Håll beräkningslogiken separat från gränssnittet så att funktionerna kan byggas ut senare.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/97244da6-da76-4fb8-8837-4f54ddba10cf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
