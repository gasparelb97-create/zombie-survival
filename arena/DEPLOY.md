# Pubblicazione automatica Arena

Il workflow **Pubblica Arena** verifica il server e prepara il Worker a ogni
modifica di `arena/` su `main`. La pubblicazione parte solo quando Cloudflare
è collegato. Non pubblica dai rami di sviluppo.

In **Settings → Secrets and variables → Actions → New repository secret** aggiungere:

| Segreto | Valore |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token Cloudflare con modello **Edit Cloudflare Workers**, limitato all'account del gioco |
| `CLOUDFLARE_ACCOUNT_ID` | ID dell'account Cloudflare del gioco |
| `TELEGRAM_NOTIFY_BOT_TOKEN` | Facoltativo: token del bot che invierà la notifica personale |
| `TELEGRAM_NOTIFY_CHAT_ID` | Facoltativo: ID della propria chat con il bot |

Avviare prima il bot in Telegram con `/start`, poi configurare i due segreti
Telegram. Nessun token va scritto nel codice o nei messaggi pubblici.
La notifica viene inviata soltanto alla chat configurata, dopo la pubblicazione
e dopo aver verificato che il Worker online risponda con la versione prevista.
Non viene inviata se la pubblicazione o la verifica fallisce. Il controllo della
versione conferma la risposta del server; non sostituisce una prova multiplayer.

Dopo aver aggiunto i segreti, aprire **Actions → Pubblica Arena → Run workflow**
e scegliere `main`. Da quel momento le successive modifiche al server Arena
verranno pubblicate automaticamente. Questo workflow pubblica solo il Worker
Arena; il client Telegram continua a usare la pubblicazione del sito esistente.

Documentazione ufficiale:
[Cloudflare e GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
