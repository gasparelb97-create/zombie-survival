# Zombie 3D v2 — consegna a Cursor

Ramo: `codex/zombie-v2-five-types`. Versione preparata: **4.3.60**.
Il lavoro è integrato in `game.html`; la pubblicazione rimane a Cursor.
Preservare l'ultima `main` e integrare questo ramo senza sovrascrivere altri aggiornamenti.

## File

- `assets/zombies-v2/models/{normal,runner,tank,bloater,boss}.glb`: cinque modelli originali 3D, con gerarchia articolata e clip Walk, Attack, Death, Crawl.
- `assets/zombies-v2/zombies.js`: geometria, identità dei tipi, statistiche, zone colpibili, monconi e ripristino del modello.
- `assets/zombies-v2/runtime.js`: animazioni procedurali, amputazioni, caduta, fisica dei pezzi staccati e percorsi locali.
- `assets/zombies-v2/catalog.json`: catalogo leggibile da altri strumenti.
- `zombie-preview.html`: anteprima interattiva dei cinque modelli, con selettore animazioni e rotazione.
- `scripts/export-zombies.mjs`: rigenera i GLB e la copia Three.js r160 per l'anteprima, senza download o dipendenze.
- `scripts/verify-zombies.mjs`: verifica GLB, integrazione e comportamento in Chromium.

Il gioco costruisce gli stessi modelli dalla sorgente condivisa: non scarica i cinque GLB durante l'avvio. I GLB sono inclusi per modifica/importazione in Blender, Three.js, Godot o altri editor. Le clip animano nodi articolati rigidi, senza una mesh SkinnedMesh separata.

## Tipi e statistiche di base

| Tipo | ID compatibile | Vita | Forza | Velocità m/s | Caratteristiche |
|---|---|---:|---:|---|---|
| Errante | normal | 90 | 11 | 1,15–1,55 | Abiti strappati, gabbia toracica esposta, inseguimento ordinario |
| Predatore | runner | 65 | 8 | 3,15–3,75 | Corpo magro, abiti rossi, corsa, sensi più ampi e breve anticipo del giocatore visibile |
| Bruto | tank | 380 | 26 | 0,82–1,02 | Corpo massiccio, gilet da lavoro e casco, arti più resistenti |
| Infetto | bloater | 155 | 34 da esplosione | 0,90–1,10 | Ventre gonfio, pustole, pelle verde, esplosione originale conservata |
| Abominio | boss | 2600 | 34 | 1,15–1,35 | Grande sagoma, ossa sporgenti, colpo ad area originale conservato |

La forza indica il danno base. Il codice originale aggiunge bonus di ondata/giorno e moltiplicatori di difficoltà; l'esplosione dell'Infetto mantiene il suo danno/area separati. Non sono numeri di danno finale garantiti.

## Colpi e movimento

Ogni braccio, gamba e testa ha un'etichetta di collisione. La resistenza degli arti è rispettivamente 20, 16, 70, 30 e 180, misurata sul danno effettivamente ricevuto dopo i moltiplicatori. I colpi deboli accumulano danno; un colpo abbastanza forte stacca subito l'arto. La perdita di una gamba avvia la transizione verso terra; perderle entrambe rallenta ulteriormente. Perdere le braccia riduce danno e capacità di trascinamento. Un colpo letale alla testa può staccarla.

Gli arti conservano posizione, orientamento e scala mondiali quando si staccano. Gravità a passi fissi di 1/60 s, collisioni con terreno e ostacoli della mappa, rimbalzi smorzati e arresto del movimento. Massimo 32 parti fisiche, rimozione dopo 7 s. Prima del riutilizzo si eliminano i vecchi riferimenti e si ripristinano le parti originali: nessun arto della nuova vita viene nascosto dal timer precedente.

Il cammino segue lo spostamento effettivo. Le pose sono interpolate; l'attacco mantiene preparazione, impatto e recupero e causa danno una volta per colpo. La morte combina cedimento articolato, impulso limitato e appoggio del corpo a terra. L'Infetto conserva la sua morte esplosiva.

## IA

Sensi e timer distinti per tipo, ricerca dell'ultima posizione, percorsi locali A* con controllo degli angoli e della larghezza del corpo. Le richieste di percorso sono distribuite nel tempo, con limite di 360 nodi e raggio di ricerca locale. Restano attive le protezioni originali del rifugio: gli zombie ignari non conoscono automaticamente la posizione nel rifugio; i colpi non attraversano muri chiusi. Il boss conserva le regole speciali originali.

## Validazione e pubblicazione

1. `node scripts/export-zombies.mjs` per rigenerare gli asset dopo modifiche al modello.
2. Con Playwright/Chromium disponibili: `node scripts/verify-zombies.mjs`.
3. `node scripts/verify-city.mjs` e `node --test arena/logic.test.mjs`.
4. Integrare in `main`, pubblicare con il procedimento del progetto e verificare la versione **4.3.60** nella Mini App e nella bacheca.
5. Provare sul telefono reale cammino/attacco, entrambe le gambe, braccia, colpo alla testa, più zombie e rientro nel menu. Includere anche la nuova città e la partita precedente.

Mappa, salvataggi, inventario, Arena, statistiche e ricompense rimangono gestiti dal codice esistente. Nessuna pubblicazione online è eseguita da questo ramo.

## Limiti da tenere presenti

Stile 3D originale e stilizzato, senza scansioni fotorealistiche. La caduta del corpo è procedurale con appoggio al terreno, non un simulatore ragdoll completo con vincoli di massa e collisione fra tutti i corpi. Le parti staccate usano collisioni semplificate del gioco, non collisioni triangolari con ogni tetto o mobile. Il percorso è locale, non una navigazione globale dell'intera città. Le verifiche nel browser non certificano FPS o assenza di problemi su ogni telefono Android: prestazioni e bilanciamento finali richiedono il dispositivo reale.
