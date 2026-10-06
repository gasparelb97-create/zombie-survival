# Nuova città 3D — prima versione di prova

## Obiettivo

Sostituire completamente la mappa attuale con una città grande, coerente e ricca di luoghi utili al Survival. La 4.3.58 resta il riferimento recuperabile: commit `1d5bf00972865ab61a952e87f2f5965e5ed7d50a`.

Questa prima versione costruisce un nuovo mondo, senza aggiungere quartieri alla vecchia mappa. È un prototipo navigabile, non il risultato artistico finale.

## Aprire la prova

Pubblicata nella 4.3.59 come prima versione giocabile: il tasto **Città nuova** accanto a **Gioca** apre la prova. **Partita attuale** riapre la mappa e i progressi originali. La sostituzione definitiva resta una fase successiva alle rifiniture e alla migrazione dei salvataggi.

- `city-preview.html`: anteprima autonoma del modello 3D, anche senza rete. Trascinare per ruotare, pizzicare o usare +/− per avvicinarsi, scegliere un quartiere oppure premere **Cammina**. Supporta WASD e pulsanti sul telefono.
- `game.html?apk=1&city=2`: nuova città dentro il gioco Survival, con controlli e collisioni reali. Il parametro `apk=1` attiva l'aspetto città fuori da Telegram.
- `game.html?apk=1`: comportamento e mappa attuali.

## Piano urbano e modello effettivamente realizzato

| Elemento | Prima versione |
| --- | --- |
| Area giocabile | 336 × 336 m, 112.896 m²; 3,06 volte l'area di 192 × 192 m |
| Edifici | 35, tutti con ingresso al piano terra e interno percorribile |
| Percorsi | 12 strade, marciapiedi, attraversamenti e collegamento al rifugio |
| Luoghi | Piazza, residenze, ospedale, polizia, scuola, farmacia, mercato, supermercato, panetteria, caffè, officine, fabbrica, depositi, stazione e rifugio |
| Interni | Case con cucina, letto e salotto; ospedale con letti e flebo; scuola con banchi; polizia con postazioni; negozi con scaffali; officine con banchi e casse; stazione con biglietteria |
| Dettagli | Ombre di contatto leggere, panchine e fioriere collidenti, chiome composte, cornicioni, balconi, finestre e assi, grondaie, condizionatori, giardini, panchine, lampioni, pensilina e binari |
| Vegetazione | 176 alberi ambientali, siepi e giardini; 126 risorse raccoglibili separate |
| Catastrofe | 24 veicoli danneggiati, un'auto ribaltata, 60 pozzanghere, 88 buche/crepe nell'asfalto, 20 resti ambientali e 60 frammenti d'ossa |
| Illuminazione | 7 veicoli con fari accesi; lampioni funzionanti alternati a lampioni spenti; fasci nella foschia e luce sull'asfalto; massimo 2 luci dinamiche su Android/iPhone o 4 su desktop |
| Fumo | 8 sorgenti da motori, relitti, tetti e ciminiere, con 112 particelle animate in un'unica chiamata di rendering |
| Salvataggi | Partita di prova in `zc_surv_city2`, profilo locale con prefisso `zc_city2_`; CloudStorage e invio classifica disattivati nella prova |

Nota sulla superficie: 336² / 192² = 3,0625. La misura è quella del mondo delimitato; non equivale a superficie libera da edifici.

L'immagine `assets/city-v2/art-direction.png` è un riferimento artistico generato: mostra la direzione desiderata, non il modello già realizzato. Non è utilizzata come sfondo del mondo giocabile.

## Verifiche eseguite

- Avvio del gioco in Chromium/WebGL senza errori JavaScript.
- 35 ingressi e 35 interni raggiungibili dal rifugio attraverso le collisioni effettive; verifica di connettività su griglia di un metro con margine del giocatore di 40 cm.
- 126 risorse riposizionate nel nuovo mondo mantenendo il sistema di raccolta.
- Partita nuova al rifugio e scrittura nella chiave di salvataggio dedicata; profilo locale separato, senza scritture CloudStorage e invio punteggi dalla prova.
- Matrici degli elementi 3D finite, senza NaN.
- La visualizzazione nuova non crea la vecchia mappa aggiuntiva `__map458`.
- Controlli del visualizzatore su desktop e formato telefono, navigazione tra quartieri e movimento.
- Regressione sulla mappa 4.3.58 senza parametro `city=2`.
- Passaggio catastrofe: 35/35 ingressi e 35/35 interni raggiungibili; 106.496 celle collegate al rifugio nella verifica su griglia.
- Chromium/WebGL: nessun errore JavaScript o shader, matrici finite, fari dinamici attivi e tempo dell'animazione del fumo in avanzamento.
- Formato Android simulato 390 × 844: movimento con i pulsanti, nessuna larghezza eccedente lo schermo e limite di 2 luci dinamiche. Non è una misura delle prestazioni sul telefono reale.
- Survival di prova avviato: 126 risorse attive, nuova partita salvata in `zc_surv_city2`, salvataggio originale `zc_surv` preservato. Regressione: senza `city=2` il mondo originale resta di 192 × 192 m.
- Incroci: asfalto tessellato come superficie continua, marciapiedi/cordoli ritagliati fuori dalle carreggiate e segnaletica unita senza facce coplanari duplicate. Le texture utilizzano coordinate del mondo per mantenere la continuità tra i tratti.
- Controllo geometrico di tutte le superfici stradali: nessuna sovrapposizione interna tra facce della stessa superficie, nessun marciapiede o cordolo dentro l'asfalto, un solo tratto d'asfalto per il centro di ciascun incrocio.

## Passi necessari prima della sostituzione definitiva

1. Portare un quartiere al livello artistico finale: finestre con aperture vere, tetti danneggiati, varianti architettoniche, rifinitura degli interni tematici e vegetazione più naturale. Gli arredi tematici di base sono già presenti, ma servono ancora varianti e dettagli artistici.
2. Riempire piazzali e zone di transizione con elementi coerenti e collidenti, mantenendo le vie di fuga.
3. Rivedere la distribuzione delle 24 casse: oggi vengono riutilizzati capienza e sistema esistenti; i 35 edifici non hanno ancora tutti una cassa.
4. Ottimizzare per il dispositivo Android reale: i controlli desktop non certificano FPS sul telefono. I batch condividono geometria/materiale, ma va introdotta una suddivisione spaziale con distanza di visibilità prima di aumentare i dettagli.
5. Evitare la costruzione temporanea del vecchio ambiente durante l'avvio della variante: questa prova lo rimuove prima di generare il mondo nuovo; una release definitiva deve separare i generatori alla fonte.
6. Definire la migrazione della partita esistente. La prova separata permette di decidere la migrazione senza cancellare progressi.
7. Solo dopo le verifiche finali, promuovere la nuova città come mappa predefinita con migrazione dei progressi. La 4.3.59 pubblica la prova separata e la annuncia nella bacheca.

## Rigenerare il visualizzatore

Dopo una modifica a `world.js`, eseguire `python3 scripts/build-city-preview.py` dalla cartella del progetto. Il comando incorpora il generatore aggiornato e il motore già presente in `game.html` nell’anteprima autonoma.

Il pulsante **Crepuscolo** cambia l'illuminazione tra notte, giorno e crepuscolo. **Relitti** porta all'incidente presso l'ospedale. Le immagini `city-catastrophe-dusk.png` e `city-catastrophe-night.png` sono catture del modello reale, non immagini concettuali.

### Verifica riproducibile

Con Node.js e Playwright disponibili, eseguire `node scripts/verify-city.mjs`. La variabile opzionale `CITY_TEST_CHROME` indica un eseguibile Chromium. Il controllo avvia un server temporaneo, verifica il rendering effettivo, tutti gli ingressi e gli interni su una griglia con margine di 40 cm, il formato telefono, il movimento, la nuova partita Survival e la separazione dei salvataggi. Rigenera anche le due catture sopra. Non misura gli FPS sul telefono fisico.

Fumo e fasci luminosi non sono collidenti e non vengono inclusi nei bersagli dei proiettili. Le buche leggere sono percorribili; veicoli e barriere mantengono collisioni. Le luci reali vicine al giocatore sono selezionate ogni 250 ms; i lampioni lontani conservano il bagliore e la luce a terra senza aumentare il numero di luci dinamiche.

Le superfici principali hanno quote distinte: asfalto a 2,5 cm, vernice a 3,5 cm, marciapiedi a 11 cm e cordoli a 19 cm. Sangue, pozzanghere, bruciature e bagliori seguono la superficie sottostante con piccoli scostamenti separati; i resti poggiano sul pavimento. Questi elementi trasparenti non scrivono nel buffer di profondità.

## Asset e licenze

- `world.js`: geometria e materiali procedurali creati per questo progetto.
- Gli elementi ripetuti condividono materiali e mesh ripetute per ridurre le chiamate di rendering.
- Le superfici fotografiche opzionali riutilizzano gli asset CC0 già presenti; vedere `assets/cc0/CREDITS.txt`.
- L'anteprima incorpora Three.js r160 con la licenza MIT preservata nell'intestazione.
