# free@home ESPHome Coffee Addon

Deze free@home Addon maakt een virtuele schakelactor **Koffiemachine** aan. Die kun je in free@home koppelen aan een tastsensor. Als de virtuele actor aan/uit wordt gezet, stuurt de addon een HTTP-call naar je ESPHome device.

Vooringesteld ESPHome endpoint:

- Aan: `http://koffiemachine.local/switch/koffiemachine_relay/turn_on`
- Uit: `http://koffiemachine.local/switch/koffiemachine_relay/turn_off`

## Structuur

```text
freeathome-esphome-coffee/
├─ package.json
├─ free-at-home-metadata.json
├─ tsconfig.json
├─ README.md
└─ src/
   └─ main.ts
```

## Installeren voor development

```bash
npm install
```

## Lokaal testen

Zet je free@home Local API variabelen:

```bash
export FREEATHOME_BASE_URL="http://192.168.1.50"
export FREEATHOME_API_USERNAME="installer"
export FREEATHOME_API_PASSWORD="jouw-wachtwoord"
```

Optioneel kun je de ESPHome instellingen overriden:

```bash
export ESPHOME_HOST="koffiemachine.local"
export ESPHOME_SWITCH_SLUG="koffiemachine_relay"
```

Build en start:

```bash
npm run build
npm start
```

## Verpakken voor installatie op de System Access Point

```bash
npm run pack
```

Daarna upload je het gegenereerde `.tar`-bestand als Addon in free@home.

## Koppelen in free@home

1. Upload en start de Addon.
2. Zoek de virtuele actor **Koffiemachine**.
3. Koppel je tastsensor-knop aan deze actor.
4. Druk op de knop om de koffiemachine aan/uit te zetten.

## Opmerking over `.local`

`koffiemachine.local` werkt alleen als mDNS bereikbaar is vanuit de omgeving waarin de addon draait. Als dit op de SysAP niet werkt, gebruik dan in de Addon-instellingen het vaste IP-adres van de ESPHome module, bijvoorbeeld `192.168.1.80`.


## Metadata

The addon metadata includes the required `author` and `url` fields for `free-at-home-cli` validation.
