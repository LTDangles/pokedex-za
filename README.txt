Pokedex API - README
====================

Files included:
- server.js             : Minimal Express server exposing /pokedex, /where, /spawnchance
- data/pokedex.json     : Semi-filled pokedex (sample entries). Replace with full 200-entry JSON from the canvas if you copied it.
- update_spawns.js      : Example script that attempts to fetch spawn data from Game8. Run locally to update JSON automatically (needs manual verification).

How to run locally:
1) Install Node (16+ recommended)
2) npm install express
3) (Optional) npm install node-fetch@2 cheerio   # for update_spawns.js
4) node server.js
5) Open http://localhost:3000/pokedex?pokemon=Pikachu

Important:
- The update_spawns.js is a helper and uses scraping — verify results before use.
- Game8 and Serebii are the recommended sources for spawn locations in Pokémon Legends: Z-A.
- If you want me to run the full replacement (server-side) using those sites, tell me and I will fetch specific entries (note: I will need to perform many web lookups).

Sources & recommended guides:
- Game8 interactive maps & spawn lists — https://game8.co/games/Pokemon-Legends-Z-A/archives/
- Serebii Pokéarth Lumiose pages — https://www.serebii.net/pokearth/lumiosecity/

