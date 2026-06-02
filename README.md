# Schibsted Personvernskjold

Liten nettleserutvidelse som automatisk avviser personalisering og
sporing på Schibsted-eide nettsteder uten å gå gjennom betalingsmuren
bak «Avvis personlig tilpassede annonser».

## Hva den gjør

- Injiserer et ferskt «alt avvist»-samtykke i Sourcepoint hver gang
  siden lastes, så banneret aldri vises.
- Nuller ut `_cmp_*` cookies og `CMP:*` localStorage.
- Sletter Pulse-sporingscookies og A/B-bøtter (`_pulse2data`,
  `_pulsesession`, `clientBucket`, `abTestId`, m.fl.).
- Overstyrer tidligere «godta»-valg om du har klikket feil før.
- Gjør alt lokalt i nettleseren. Ingen nettverkskall, ingen telemetri.

## Lisens

Se `LICENSE`. Bruk, kopier og endre fritt.
