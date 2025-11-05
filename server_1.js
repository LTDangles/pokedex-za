// server.js (Express API) - caching and rate-limiting included
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const app = express();
const PORT = process.env.PORT || 3000;

const cache = new NodeCache({ stdTTL: 30, checkperiod: 60 });
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

const dataPath = path.join(__dirname, 'data', 'pokedex.json');
let POKEDEX = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function findPokemon(q){
  if(!q) return null;
  q = q.trim().toLowerCase();
  return POKEDEX.find(p => p.name.toLowerCase() === q || String(p.id) === q) || null;
}

function buildResponse(p){
  const locs = (p.spawn_locations||[]).slice(0,5).map(l=>`${l.name} (${l.chance})`).join(', ') || 'Unknown';
  return `${p.name} (#${String(p.id).padStart(3,'0')}) — ${p.types.join('/')} | Dex: ${p.dex_entry} | Locations: ${locs} | Spawn: ${p.spawn_rate} | Evolves: ${p.evolution || '—'}`;
}

app.get('/pokedex', (req, res) => {
  const { pokemon, random } = req.query;
  const cacheKey = `/pokedex:${pokemon||'random'}:${random||''}`;
  const cached = cache.get(cacheKey);
  if(cached) return res.status(200).send(cached);

  let p;
  if(random === '1' || !pokemon){
    p = POKEDEX[Math.floor(Math.random()*POKEDEX.length)];
  } else {
    p = findPokemon(pokemon);
    if(!p) return res.status(200).send(`No data for "${pokemon}".`);
  }
  const text = buildResponse(p);
  cache.set(cacheKey, text);
  res.set('Cache-Control', 'public, max-age=30');
  res.status(200).send(text);
});

app.get('/where', (req, res) => {
  const { pokemon } = req.query;
  const cacheKey = `/where:${pokemon||''}`;
  const cached = cache.get(cacheKey);
  if(cached) return res.status(200).send(cached);

  const p = findPokemon(pokemon);
  if(!p) return res.status(200).send(`No location data for "${pokemon}".`);
  const locs = (p.spawn_locations||[]).map(l=>`${l.name} — ${l.chance}`).join('; ') || 'Unknown';
  const text = `${p.name} locations: ${locs}`;
  cache.set(cacheKey, text);
  res.set('Cache-Control', 'public, max-age=30');
  res.status(200).send(text);
});

app.get('/spawnchance', (req, res) => {
  const { pokemon } = req.query;
  const cacheKey = `/spawnchance:${pokemon||''}`;
  const cached = cache.get(cacheKey);
  if(cached) return res.status(200).send(cached);

  const p = findPokemon(pokemon);
  if(!p) return res.status(200).send(`No spawn chance data for "${pokemon}".`);
  const text = `${p.name} overall spawn chance: ${p.spawn_rate}. Top spots: ${(p.spawn_locations||[]).slice(0,3).map(l=>l.name+'('+l.chance+')').join(', ') || 'None'}`;
  cache.set(cacheKey, text);
  res.set('Cache-Control', 'public, max-age=30');
  res.status(200).send(text);
});

app.listen(PORT, ()=> console.log(`API listening on ${PORT}`));
