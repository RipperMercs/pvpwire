// PVPWire RSS sources, v1. Twenty-feed seed list per spec section 6.1.
// Verify each URL is live at first deploy. Dead feeds are logged and excluded.

import type { RSSSource } from './types';

export const SOURCES: RSSSource[] = [
  { name: 'Dot Esports', url: 'https://dotesports.com/feed', domain: 'dotesports.com' },
  { name: 'Dexerto', url: 'https://www.dexerto.com/feed/', domain: 'dexerto.com' },
  { name: 'HLTV', url: 'https://www.hltv.org/rss/news', domain: 'hltv.org' },
  { name: 'Liquipedia News', url: 'https://liquipedia.net/dota2/Special:RecentChanges?feed=atom', domain: 'liquipedia.net' },
  { name: 'ESPN Esports', url: 'https://www.espn.com/espn/rss/esports/news', domain: 'espn.com' },
  { name: 'theScore esports', url: 'https://www.thescore.com/esports/news.rss', domain: 'thescore.com' },
  { name: 'Esports Insider', url: 'https://esportsinsider.com/feed/', domain: 'esportsinsider.com' },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/', domain: 'pcgamer.com' },
  { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed', domain: 'rockpapershotgun.com' },
  { name: 'Eurogamer', url: 'https://www.eurogamer.net/feed', domain: 'eurogamer.net' },
  { name: 'PCGamesN', url: 'https://www.pcgamesn.com/mainrss.rss', domain: 'pcgamesn.com' },
  { name: 'MassivelyOP', url: 'https://massivelyop.com/feed/', domain: 'massivelyop.com' },
  { name: 'MMORPG.com', url: 'https://www.mmorpg.com/rss', domain: 'mmorpg.com' },
  { name: 'EventHubs', url: 'https://www.eventhubs.com/rss/news/', domain: 'eventhubs.com' },
  { name: 'Inven Global', url: 'https://www.invenglobal.com/rss', domain: 'invenglobal.com' },
  { name: 'Esports.gg', url: 'https://esports.gg/feed/', domain: 'esports.gg' },
  { name: 'The Loadout', url: 'https://www.theloadout.com/feed', domain: 'theloadout.com' },
  { name: 'Game Rant Esports', url: 'https://gamerant.com/feed/category/gaming/esports/', domain: 'gamerant.com' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', domain: 'polygon.com' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss', domain: 'kotaku.com' },
];
