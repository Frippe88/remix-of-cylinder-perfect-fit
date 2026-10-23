# Resultatöversikt
- [x] Förenkla rekommendationen och dölj alternativa kombinationer tills de efterfrågas.
- [x] Skilj insida och utsida tydligt; behåll samtliga alternativ och befintliga beräkningar.
- [x] Kontrollera tester och flödet på mobil och dator (22 tester godkända; flödet kontrollerat i 390, 768 och 1280 px).
- [x] Visa tydligt vilken sida varje alternativ tillhör: sidmärke på alla kort, "för utsida/insida" på knappar och räknare, sidrubrik som följer med vid scroll.

# Stolpväljare
- [x] To bort fliken, sidan och alla stödfiler helt (återkommer kanske senare).
- [x] Lägg in ASSA-stolpar för elslutbleck (700- och 900-serien) och fabrikatsfilter.
- [ ] Bilder på ASSA elslutbleckstolpar (saknar verifierade foton).

# iLOQ dubbelcylinder
- [x] Räkna med 6 mm extra på insidan (två 3 mm brickor) och visa förklaring.

# Tolerans
- [x] Oval: −2 till +2 mm. Rund: ingen regel, närmaste vinner, ingen varning.

# Domän och synlighet
- [x] Byt domän i alla ställen där xn--cylinderhjlpen-fib.se är inbakad (robots.txt, sitemap, guider, startsidan).
- [x] Koppla cylinderhjalpen.se som custom domain i Lovable (DNS hos Strato stämmer: A → 185.158.133.1).
- [x] Sätt cylinderhjalpen.se som primär domän (Project Settings → Domains → ⋯ → Set as primary) så att den gamla adressen vidarbefordrar dit.
- [x] Skicka in sitemap.xml till Google Search Console (skickad 2026-10-23; verifierad som ägare med HTML-tagg).
- [ ] E-post: notify.cylinderhjalpen.se behöver delegated DNS till Lovable innan mallar kan skickas därifrån (send-email.ts pekar idag på notify.xn--cylinderhjlpen-fib.se; kontakt är mailto, skickas inte).

# Guider
- [x] Korta rubriken "Räkna cylinderlängd" så guidlistan blir jämnare.
- [x] Jämna mellanrum mellan guidekorten på startsidan (lika höjd i tvåkolumnsraden).
- [x] Litet mellanrum mellan guide-sektionen och "Kontakta oss" på startsidan.
- [x] Ta bort montageskissen under bästa rekommendationen.
- [x] Ta bort etiketten ovanför guide-sektionen på startsidan helt ("Kunskapsbank"/"Tips & guider"); bara rubriken står kvar.

# Plocklista
- [x] Lyft listans utseende (tydligare rader per sida, bättre typografi) utan att den kopierade texten blir konstig.
- [x] Rund cylinder har samma ring ute och inne – ingen sidindelning för rund (väljare, plocklista, totalsumma).
- [x] Sidans färg (blå utsida, grön insida) finns på sidetiketter, förlängar-/ringchips och projektets totalsumma.
- [x] Utsida/Insida-väljaren för enkel cylinder har sidans färg (blå/grön), även i hjälptexten.

# Projekt
- [x] Tona ner hela blå/gröna ytor och lyft projektfliken med orange detaljer; båda vyerna kontrollerade i ljust/mörkt på telefon och dator.
- [x] Förfina projektflikens sidfärger, dörrstatus och materialöversikt i ljust och mörkt läge; båda vyerna verifierade på telefon och dator, 14 tester godkända.
- [x] Flera dörrar per projekt med totalsumma och "dörr för dörr"-lista, sparat lokalt utan konto.

- [x] Plocklistan: varje rad för dörr 1–4 måste visa utsida/insida (även i kopierad text)
- [x] Flera projekt igång samtidigt (välj, skapa nytt, ta bort)
- [x] Alla knappar ger samma taktila klick som förlängarchipsen
- [x] Pil i projektväljaren flyttad lite in från högerkanten (egen chevron istället för webbläsarens)
- [x] Total plocklista: välja "Kvar att montera" eller "Hela projektet" så monterade dörrar inte räknas med
- [x] Plocklistan visar vilket projekt dörren sparas i: raden "Sparas i <namn> · antal dörrar" med "Byt projekt", och spara-knappen har projektets namn
- [x] "Byt projekt" i plocklistan stänger projektfliken direkt när ett projekt valts – man hamnar tillbaka vid plocklistan och kan spara. Öppnar man fliken som vanligt får den stå kvar.
- [x] Kopiera dörrlista, inköpslista och "inköpslista och dörrlista" samlade i en grupp – endast i "Total plocklista", inte i "Dörr för dörr".
