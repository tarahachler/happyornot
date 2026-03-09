import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(process.cwd(), "public")));

const USER_AGENT = "phrase-wall/0.1 (contact: you)";

// Tes sources (sub + catégorie/flair)
const SOURCES = [
  { subreddit: "ProductivityApps", flair: "General Advice" },
  { subreddit: "productivity", flair: "Technique" },
  { subreddit: "labubu", flair: "Display/OOTD/Collection" },
  { subreddit: "getdisciplined", flair: "🔄 Method" },
];

function mapToTitles(listingJson) {
  return (listingJson?.data?.children || [])
    .map((c) => c?.data)
    .filter(Boolean)
    .map((p) => (p.title || "").trim())
    .filter((t) => t.length > 0);
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!r.ok) throw new Error(`HTTP ${r.status} on ${url}`);
  return r.json();
}

// 1) Essayez via search + flair
async function fetchTitlesByFlair(subreddit, flair, limit = 5) {
  const url =
    `https://www.reddit.com/r/${subreddit}/search.json` +
    `?q=${encodeURIComponent(`flair:"${flair}"`)}` +
    `&restrict_sr=1&sort=new&limit=${limit}`;

  const json = await fetchJson(url);
  return mapToTitles(json).slice(0, limit);
}

// 2) Fallback : derniers posts "new"
async function fetchTitlesNew(subreddit, limit = 20) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
  const json = await fetchJson(url);
  return mapToTitles(json);
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeTitle(t) {
  // Nettoyage léger pour éviter des “Quote marks” ou espaces bizarres
  return t.replace(/\s+/g, " ").trim();
}

app.get("/api/phrases", async (req, res) => {
  const perSource = Number(req.query.perSource || 5);

  try {
    const all = [];

    for (const src of SOURCES) {
      // A) flair
      let titles = [];
      try {
        titles = await fetchTitlesByFlair(src.subreddit, src.flair, perSource);
      } catch {
        titles = [];
      }

      // B) compléter si insuffisant
      if (titles.length < perSource) {
        const more = await fetchTitlesNew(src.subreddit, 50);
        const pool = more
          .map(normalizeTitle)
          .filter((t) => !titles.includes(t));
        titles = titles.concat(pool.slice(0, perSource - titles.length));
      }

      titles.slice(0, perSource).forEach((t) => {
        all.push(normalizeTitle(t));
      });
    }

    shuffleInPlace(all);

    res.json({
      count: all.length,
      phrases: all,
    });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});