"""Verify the deployed Worker, then optionally notify the configured owner."""
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.request import Request, urlopen

ARENA_URL = 'https://zs-arena.gasparelb97.workers.dev'
GAME_URL = 'https://gasparelb97-create.github.io/zombie-survival'


def expected_version():
    source = Path('arena/worker.js').read_text()
    match = re.search(r'arena:\s*true,\s*v:\s*(\d+)', source)
    if not match:
        raise ValueError('Versione Worker non trovata')
    return int(match.group(1))


def client_online():
    notes = json.loads(Path('arena/release-notes.json').read_text())
    version = notes['game_version']
    stamp = os.environ.get('GITHUB_SHA', 'check')
    def read(path):
        request = Request(f'{GAME_URL}/{path}?release={stamp}&check={time.time_ns()}',
                          headers={'User-Agent': 'ZombieSurvival-Release/1.0', 'Cache-Control': 'no-cache'})
        with urlopen(request, timeout=10) as response:
            return response.read().decode('utf-8')
    actual = read('version.txt').strip()
    if actual != version:
        raise ValueError(f'Gioco online {actual}, atteso {version}')
    news = json.loads(read('updates.json'))
    if not news.get('recent') or news['recent'][0].get('ver') != version:
        raise ValueError(f'Bacheca non ancora aggiornata a {version}')
    if f"window.GAME_VER='{version}'" not in read('game.html'):
        raise ValueError(f'Client non ancora aggiornato a {version}')
    return True


def verify():
    expected = expected_version()
    last_issue = 'Controllo non eseguito'
    for attempt in range(72):
        try:
            url = f'{ARENA_URL}/?release={os.environ.get("GITHUB_SHA", "check")}&check={time.time_ns()}'
            request = Request(url, headers={'User-Agent': 'ZombieSurvival-Release/1.0', 'Cache-Control': 'no-cache'})
            with urlopen(request, timeout=10) as response:
                data = json.load(response)
            if data.get('ok') is True and data.get('arena') is True and data.get('v') == expected and client_online():
                print(f'Gioco e bacheca online: {json.loads(Path("arena/release-notes.json").read_text())["game_version"]}; Arena {expected}')
                return
            last_issue = f'Arena online {data.get("v")}, attesa {expected}'
        except ValueError as error:
            last_issue = str(error)
        except Exception as error:
            last_issue = f'Connessione non pronta ({type(error).__name__})'
        if attempt % 6 == 0:
            print(f'Attesa pubblicazione: {last_issue}', flush=True)
        if attempt < 71:
            time.sleep(5)
    raise RuntimeError(f'Verifica pubblicazione fallita: {last_issue}. Nessuna notifica di successo inviata')


def notification_text():
    version = expected_version()
    notes = json.loads(Path('arena/release-notes.json').read_text())
    changes = notes.get('changes', [])
    if notes.get('version') != version or not changes or not all(isinstance(x, str) and x.strip() for x in changes):
        raise ValueError('Aggiornare le note di rilascio per la versione Arena pubblicata')
    summary = '\n'.join('• ' + item.strip() for item in changes)
    game_version = notes['game_version']
    text = f'✅ Zombie Survival aggiornato e online\nVersione gioco: {game_version} · Arena: {version}\n\nNovità:\n{summary}\n\nChiudi e riapri il gioco su Telegram.'
    if len(text) > 4000:
        raise ValueError('Note di rilascio troppo lunghe per Telegram')
    return text


def notify():
    token = os.environ.get('TELEGRAM_NOTIFY_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_NOTIFY_CHAT_ID', '')
    if not token or not chat_id:
        print('::notice::Notifica Telegram non configurata: nessun messaggio inviato.')
        return
    # Recheck immediately before sending. Only the explicitly configured chat is used.
    verify()
    text = notification_text()
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
