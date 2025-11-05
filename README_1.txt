Pokedex Batch 3 Bundle (IDs 51-100)
----------------------------------
Files included:
- data/pokedex.batch3.51-100.json  : Batch-only JSON (entries 51-100)
- data/pokedex.json                : Merged pokedex up to 100 (1-50 placeholders + 51-100 real)
- server.js                        : Express API with caching & rate-limiting
- BATCH_3_REPORT.txt               : Summary file (see below)

How to use:
1) Install node dependencies:
   npm install express express-rate-limit node-cache
2) Run the server:
   node server.js
3) Test:
   http://localhost:3000/pokedex?pokemon=Pikachu
   http://localhost:3000/where?pokemon=Bulbasaur
   http://localhost:3000/spawnchance?pokemon=51

Notes:
- Spawn fields are synthesized using PokéAPI as the canonical data source for names/types/evolutions.
- Spawn locations/rates are Lumiose-themed plausible entries (textual) to match your existing dataset style.
- Replace placeholders for IDs 1-50 with the earlier provided JSON to create a fully accurate set.
- If you want numeric spawn percentages, I can help you add them if you provide a source or allow live scraping.
