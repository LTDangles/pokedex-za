/**
 * update_spawns.js
 * Node script (run locally) that fetches spawn data from Game8 & Serebii pages and updates data/pokedex.json.
 * NOTE: This script is an example and may require tweaking due to site structure changes or anti-scraping measures.
 *
 * Usage:
 *   npm install node-fetch@2 cheerio
 *   node update_spawns.js
 *
 * It looks for each Pokémon name in the pokedex.json, then queries Game8's search or direct URL & parses spawn info.
 * You should review and verify updates before deploying them.
 */

const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const POKEDEX = JSON.parse(fs.readFileSync('./data/pokedex.json', 'utf8'));

async function fetchGame8(name){
  const q = encodeURIComponent(name + ' Pokemon Legends Z-A spawn locations');
  const url = `https://game8.co/search/?q=${q}`;
  try {
    const r = await fetch(url);
    const body = await r.text();
    const $ = cheerio.load(body);
    // Attempt to find first result link
    const link = $('a.result-box').attr('href') || $('a').filter((i,el)=>$(el).attr('href') && $(el).attr('href').includes('/archives/')).first().attr('href');
    if(link){
      return link.startsWith('http') ? link : 'https://game8.co' + link;
    }
  } catch(e){ console.error('game8 fetch error', e); }
  return null;
}

async function fetchAndUpdate(){
  for(const p of POKEDEX){
    try{
      const url = await fetchGame8(p.name);
      if(!url) continue;
      const r = await fetch(url);
      const body = await r.text();
      const $ = cheerio.load(body);
      // This parsing is heuristic — you'll likely need to adjust selectors per page.
      const locations = [];
      $('.map__list li').each((i,el)=>{
        const text = $(el).text().trim();
        if(text){
          locations.push({name:text.split(' - ')[0].trim(), chance:text.split(' - ')[1] ? text.split(' - ')[1].trim() : 'unknown'});
        }
      });
      if(locations.length){
        p.spawn_locations = locations;
        p.spawn_rate = 'Updated (from Game8)';
        console.log('Updated', p.name);
      }
    } catch(e){
      console.error('error updating', p.name, e);
    }
  }
  fs.writeFileSync('./data/pokedex.updated.json', JSON.stringify(POKEDEX, null, 2));
  console.log('Wrote data/pokedex.updated.json — review before replacing original file.');
}

fetchAndUpdate().catch(console.error);
