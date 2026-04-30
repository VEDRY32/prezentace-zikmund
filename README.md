# Zikmund Lucembursky — Interaktivni prezentace

Interaktivni webova prezentace o Zikmundovi Lucemburskem (1368–1437), poslednim lucemburskem cisari Svate rise rimske.

## Ovladani

### Klavesove zkratky

| Klavesa | Akce |
|---------|------|
| `→` / `Mezernik` / `↓` | Dalsi slide |
| `←` / `↑` | Predchozi slide |
| `1`–`9` | Skok na slide 1–9 |
| `0` | Skok na slide 10 |
| `-` | Skok na slide 11 |
| `Escape` | Navrat na titulni slide |
| `M` | Ztlumit/Zapnout zvuk (nebo klik na tlacitko) |

### Mys
- **Scroll dolu/nahoru** — dalsi/predchozi slide
- **Klik na progress bar** — skok na konkretni slide
- **Klik na "Mapa"** — otevrit interaktivni mapu Evropy

### Mapa Evropy
- Kliknete na tlacitko **Mapa** v pravem hornim rohu
- Na mape jsou vyznacene klicova mista Zikmundova zivota
- Kliknutim na bod se preskoci na prislusny slide

## Easter Eggs

### Tajny dopis kronikare
Napijte na klavesnici cisla **1 4 3 7** (postupne) — otevre se skryty slide s humornym dopisem kronikare. Stisknete **Escape** pro zavreni.

### Latinske citaty
Kazdych ~30 sekund se v pravem dolnim rohu na 5 sekunt zobrazi nahodny latinsky citat (napr. *"Sic transit gloria mundi"*).

### Kurzor pera
Mys se zobrazuje jako inkoustove pero. Pri najeti na klikatelne prvky se kurzor zmeni na pechetni vosk.

### Hover nad citacemi a zajimavostmi
Pri najeti kurzorem na citace ci zajimavosti se objevi jemna inkoustova skvrna.

### Znak Lucemburku
Znak v rohu se pri najeti otaci (3D CSS efekt). Klik na nej = kratka fanfara.

## Slidy

1. **Titulni** — Zikmund Lucembursky, posledni lucembursky cisar
2. **Syn Otce Vlasti** — Puvod a detstvi
3. **Koruna Svateho Stepana** — Uhersky kral (1387)
4. **Katastrofa na Dunaji** — Bitva u Nikopole (1396)
5. **Bratr proti Bratrovi** — Boj o cesky trun
6. **Plameny v Kostnici** — Kostnicky koncil (1414–1418)
7. **Krizove vypravy proti Cechum** — Husitske valky (1419–1434)
8. **Koruna Imperia** — Rimsky cisar (1411/1433)
9. **Pergamen miru** — Kompaktata a smireni (1436)
10. **Svice dohasina** — Konec cesty (1437)
11. **Lisak nebo statnik?** — Odkaz a hodnoceni

## Technologie

- **Vanilla HTML/CSS/JavaScript** — zadny build, zadny framework
- **GSAP 3.x + ScrollTrigger** — animace
- **Three.js r128** — 3D sceny (Nikopol, Kostnice, Korunovace)
- **Howler.js** — audio management
- **Lottie-web** — animace (svicka)
- **Google Fonts** — Cinzel, Cormorant Garamond, IM Fell English

## Otevreni

Pro otevreni staci dvakrat kliknout na `index.html` — prezentace funguje jako staticky web bez serveru.

Pro nejlepsi zazitek pouzijte prohlizec **Chrome** nebo **Firefox** na desktape (1920x1080 nebo vetsi).

## Credits

### Obrazy
Vsechny dobove obrazy jsou z **Wikimedia Commons** (public domain):
- Zikmund Lucembursky — Albrecht Durer portret (1512)
- Karel IV. — votivni obraz Jana Ocka z Vlasimi
- Bitva u Nikopole — Froissartova kronika
- Upaleni Jana Husa — Spiezer Chronik (1485)
- Husitska vozova hradba — Jensky kodex

### Hudba a zvukove efekty
Pro plny audio zazitek je treba doplnit soubory do `assets/audio/`:
- `medieval-ambient.mp3` — stredoveka ambientni hudba (loop)
- `page-flip.mp3`, `bell.mp3`, `battle.mp3`, `fire.mp3`, `drums.mp3`, `fanfare.mp3`, `seal.mp3`, `candle.mp3`, `book-close.mp3`

Pokud audio soubory chybi, prezentace vytvori jednoduchy ambientni zvuk pomoci Web Audio API.

### Fonty
- Cinzel (Google Fonts) — nadpisy
- Cormorant Garamond (Google Fonts) — body text
- IM Fell English (Google Fonts) — citace

## Design system

Prezentace pouziva design system inspirovany stredovekym pergamenem:
- Pergamenove pozadi (teple okrove odstinu)
- Inkoustovy text (tmave hnede)
- Zlata akcenta (pro cisarska tema)
- Burgundska cervena (pro husitske valky)
- Stredoveka ornamentika (iluminovane rohy, pechety, drop caps)

## Responzivni design

- **Desktop 1920x1080** — optimalni
- **Desktop 1366x768** — plne podporovano
- **Tablet 768–1366** — zjednodusena verze
- **Mobile <768** — varovani + zjednodusena verze

## Licence

Tato prezentace je vytvorena pro vyukove ucele. Vsechny historicke obrazy jsou public domain. Prezentacni kod je volne pouzitelny.# prezentace-zikmund
