# Dafhio Dominion

A light, mobile-ready real-time strategy skirmish game that runs in any modern browser (Android 10+, iOS, desktop).
Single HTML file + Three.js (r128 from cdnjs). Original factions inspired by classic RTS archetypes.

## Play
- **Single player:** open `dafhio-dominion.html` in a browser → pick a race → **Deploy vs AI**.
- **LAN (same Wi-Fi):**
  - **Direct (no server):** both players open the game → *LAN multiplayer* → enter a name → host presses **Host → Invite a player**, the friend presses **Join**, scans/pastes the invite code, then shows the reply code back to the host.
  - **Server:** on a PC run `node server.js` (Node 18+, no dependencies) next to `dafhio-dominion.html`. Everyone opens the printed `http://<PC-IP>:8080` address → *LAN multiplayer* → **Server** → Host / Join.
  - Modes: 1v1, 3v3 (co-op or versus) and 6-player FFA; empty slots are filled by AI.
- First load needs internet (Three.js from cdnjs); after that the browser cache usually covers LAN play.

## Features
- 7 races: Vanguard Directive, Hollow Swarm, Aether Covenant, Iron Templars, Gorrak Warband, Hollow Legion, Ashen Cult – each with 10 units, 7 structures, a hero, a caster spell and a commander power.
- 4 maps (standard + large 6-player versions): Iron Basin, Golden Core, Shattered Isles, Verdant Twin Lanes.
- Map events: meteor showers, supply drops, Ancient Colossus boss, crystal blooms at the centre.
- Score, MVP and 15 achievements (saved on the device).
- Graphics: Low / Medium / High / Ultra (PC, real-time shadows) with automatic lag guard.
- Procedural WebAudio sound, music and unit voices.
- Touch controls: hold-drag box select, hold to grab nearby army, control groups, building quick-select.

## Files
| File | Purpose |
|---|---|
| `dafhio-dominion.html` | The whole game |
| `server.js` | Optional LAN relay + static server |

## Credits
Three.js (MIT). Game code and art are procedural/original.
