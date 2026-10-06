"""Verify the deployed Worker, then optionally notify the configured owner."""
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.request import Request, urlopen

ARENA_URL = 'https://zs-arena.gasparelb97.workers.dev'


def expected_version():
    source = Path('arena/worker.js').read_text()
    match = re.search(r'arena:\s*true,\s*v:\s*(\d+)', source)
    if not match:
        raise ValueError('Versione Worker non trovata')
    return int(match.group(1))


def verify():
    expected = expected_version()
    for attempt in range(12):
        try:
            url = f'{ARENA_URL}/?release={os.environ.get("GITHUB_SHA", "check")}'
            with urlopen(url, timeout=10) as response:
                data = json.load(response)
            if data.get('ok') is True and data.get('arena') is True and data.get('v') == expected:
                print(f'Arena online: versione {expected}')
                return
        except Exception:
            pass
        if attempt < 11:
            time.sleep(5)
    raise RuntimeError('La versione pubblicata non risponde: nessuna notifica di successo inviata')


def notify():
    token = os.environ.get('TELEGRAM_NOTIFY_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_NOTIFY_CHAT_ID', '')
    if not token or not chat_id:
        print('::notice::Notifica Telegram non configurata: nessun messaggio inviato.')
        return
    # Recheck immediately before sending. Only the explicitly configured chat is used.
    verify()
    version = expected_version()
    text = f'✅ Arena aggiornata e online (versione {version}). Puoi riaprire il gioco su Telegram.'
    payload = json.dumps({'chat_id': chat_id, 'text': text}).encode()
    request = Request(f'https://api.telegram.org/bot{token}/sendMessage',
                      data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urlopen(request, timeout=15) as response:
            result = json.load(response)
        if result.get('ok') is not True:
            raise ValueError('Telegram non ha confermato il messaggio')
    except Exception:
        # Do not log exception URLs: the bot token is part of the Telegram URL.
        raise RuntimeError('Arena online, ma la notifica Telegram non è stata confermata') from None
    print('Notifica Telegram inviata alla chat configurata.')


if __name__ == '__main__':
    try:
        {'verify': verify, 'notify': notify}[sys.argv[1]]()
    except Exception as error:
        print(f'::error::{error}', file=sys.stderr)
        sys.exit(1)
