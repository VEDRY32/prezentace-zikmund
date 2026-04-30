# Zikmund Lucemburský — Interaktivní prezentace

Interaktivní webová prezentace o Zikmundovi Lucemburském (1368–1437), posledním lucemburském císaři Svaté říše římské.

## Ovládání

### Klávesové zkratky

| Klávesa | Akce |
|---------|-------|
| `→` / `Mezerník` / `↓` | Další slide |
| `←` / `↑` | Předchozí slide |
| `1`–`9` | Skok na slide 1–9 |
| `0` | Skok na slide 10 |
| `-` | Skok na slide 11 |
| `Escape` | Návrat na titulní slide |
| `M` | Ztlumit / zapnout zvuk |

### Myš

- **Scroll dolů / nahoru** — další / předchozí slide
- **Klik na progress bar** — skok na konkrétní slide
- **Klik na „Mapa"** — otevřít interaktivní mapu Evropy

### Mapa Evropy

- Klikněte na tlačítko **Mapa** v pravém horním rohu
- Na mapě jsou vyznačené klíčová místa Zikmundova života
- Kliknutím na bod se přeskočí na příslušný slide

## Skryté funkce

### Tajný dopis kronikáře

Napište na klávesnici čísla **1 4 3 7** (postupně) — otevře se skrytý slide s humorným dopisem kronikáře. Stiskněte **Escape** pro zavření.

### Latinské citáty

Každých ~30 sekund se v pravém dolním rohu na 5 sekund zobrazí náhodný latinský citát (např. *"Sic transit gloria mundi"*).

### Kurzor pera

Myš se zobrazuje jako inkoustové pero. Při najetí na klikatelné prvky se kurzor změní na pečetní vosk.

### Hover nad citáty a zajímavostmi

Při najetí kurzorem na citáty či zajímavosti se objeví jemná inkoustová skvrna.

### Znak Lucemburku

Znak v rohu se při najetí otáčí (3D CSS efekt). Klik na něj = krátká fanfara.

## Slidy

1. **Titulní** — Zikmund Lucemburský, poslední lucemburský císař
2. **Syn Otce Vlasti** — Původ a dětství
3. **Koruna svatého Štěpána** — Uherský král (1387)
4. **Katastrofa na Dunaji** — Bitva u Nikopole (1396)
5. **Bratr proti bratrovi** — Boj o český trůn
6. **Plameny v Kostnici** — Kostnický koncil (1414–1418)
7. **Křížové výpravy proti Čechům** — Husitské války (1419–1434)
8. **Koruna imperia** — Římský císař (1411/1433)
9. **Pergamen míru** — Kompaktáta a smíření (1436)
10. **Svíce dohasíná** — Konec cesty (1437)
11. **Lišák nebo státník?** — Odkaz a hodnocení

## Technologie

- **Vanilla HTML/CSS/JavaScript** — žádný build, žádný framework
- **GSAP 3.x + ScrollTrigger** — animace
- **Three.js r128** — 3D scény (Nikopol, Kostnice, Korunovace)
- **Howler.js** — audio management
- **Lottie-web** — animace (svíčka)
- **Google Fonts** — Cinzel, Cormorant Garamond, IM Fell English

## Otevření

Pro otevření stačí dvakrát kliknout na `index.html` — prezentace funguje jako statický web bez serveru.

Pro nejlepší zážitek použijte prohlížeč **Chrome** nebo **Firefox** na desktopu (1920×1080 nebo větší).

## Zdroje

### Obrazy

Všechny dobové obrazy jsou z **Wikimedia Commons** (public domain):

- Zikmund Lucemburský — Albrecht Dürer portrét (1512)
- Karel IV. — votivní obraz Jana Očka z Vlašimi
- Bitva u Nikopole — Froissartova kronika
- Upálení Jana Husa — Spiezer Chronik (1485)
- Husitská vozová hradba — Jenský kodex

### Hudba a zvukové efekty

Pro plný audio zážitek je třeba doplnit soubory do `assets/audio/`:

- `medieval-ambient.mp3` — středověká ambientní hudba (loop)
- `page-flip.mp3`, `bell.mp3`, `battle.mp3`, `fire.mp3`, `drums.mp3`, `fanfare.mp3`, `seal.mp3`, `candle.mp3`, `book-close.mp3`

Pokud audio soubory chybí, prezentace vytvoří jednoduchý ambientní zvuk pomocí Web Audio API.

### Fonty

- **Cinzel** (Google Fonts) — nadpisy
- **Cormorant Garamond** (Google Fonts) — tělový text
- **IM Fell English** (Google Fonts) — citáty

## Designový systém

Prezentace používá designový systém inspirovaný středověkým pergamene:

- Pergamenové pozadí (teplé okrové odstíny)
- Inkoustový text (tmavě hnědé)
- Zlaté akcenty (pro císařská témata)
- Burgundská červená (pro husitské války)
- Středověká ornamentika (iluminované rohy, pečeti, drop caps)

## Responzivní design

| Rozlišení | Podpora |
|-----------|---------|
| Desktop 1920×1080 | Optimální |
| Desktop 1366×768 | Plně podporováno |
| Tablet 768–1366 | Zjednodušená verze |
| Mobil < 768 | Varování + zjednodušená verze |

## Licence

Tato prezentace je vytvořena pro výukové účely. Všechny historické obrazy jsou public domain. Prezentační kód je volně použitelný.