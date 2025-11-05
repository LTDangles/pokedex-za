// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const dataPath = path.join(__dirname, 'data', 'pokedex.json');
let POKEDEX = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function findPokemon(q) {
  if (!q) return null;
  q = q.trim().toLowerCase();
  return POKEDEX.find(p => p.name.toLowerCase() === q || String(p.id) === q) || null;
}

app.get('/pokedex', (req, res) => {
  const { pokemon, random } = req.query;
  let p;
  if (random === '1' || !pokemon) {
    p = POKEDEX[Math.floor(Math.random() * POKEDEX.length)];
  } else {
    p = findPokemon(pokemon);
    if (!p) return res.status(200).send(`No data for "${pokemon}". Try !pokedex <name>.`);
  }
  const locs = (p.spawn_locations || []).slice(0,5).map(l => `${l.name} (${l.chance})`).join(', ') || 'Unknown';
  const text = `${p.name} (#${String(p.id).padStart(3,'0')}) — ${p.types.join('/')} | Dex: ${p.dex_entry || '—'} | Locations: ${locs} | Spawn: ${p.spawn_rate || 'Unknown'} | Evolves: ${p.evolution || '—'}`;
  res.set('Cache-Control', 'public, max-age=60');
  return res.status(200).send(text);
});

app.get('/where', (req, res) => {
  const { pokemon } = req.query;
  const p = findPokemon(pokemon);
  if (!p) return res.status(200).send(`No location data for "${pokemon}".`);
  const locs = (p.spawn_locations || []).map(l => `${l.name} — ${l.chance}`).join('; ') || 'Unknown';
  res.status(200).send(`${p.name} locations: ${locs}`);
});

app.get('/spawnchance', (req, res) => {
  const { pokemon } = req.query;
  const p = findPokemon(pokemon);
  if (!p) return res.status(200).send(`No spawn chance data for "${pokemon}".`);
  res.status(200).send(`${p.name} overall spawn chance: ${p.spawn_rate || 'Unknown'}. Top spots: ${(p.spawn_locations||[]).slice(0,3).map(l=>l.name+'('+l.chance+')').join(', ') || 'None'}`);
});

app.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
