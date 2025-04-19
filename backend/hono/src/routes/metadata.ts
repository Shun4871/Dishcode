import { Hono } from 'hono';

const metadataRoute = new Hono();

metadataRoute.get('/metadata', async (c) => {
  const queries = c.req.queries();
  const urls = queries.url ?? [];

  const urlList = Array.isArray(urls) ? urls : [urls];

  const fetchMetadata = async (url: string) => {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MyScraperBot/1.0; +https://example.com/bot)',
        },
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);

      const html = await res.text();

      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'タイトルが取得できませんでした';

      const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
      const image = ogImageMatch ? ogImageMatch[1].trim() : '';

      return { url, title, image };
    } catch (e) {
      console.error(`❌ Error fetching metadata for ${url}:`, e);
      return null; // 取得失敗は除外対象
    }
  };

  const resultsWithNulls = await Promise.all(urlList.map(fetchMetadata));
  const results = resultsWithNulls.filter((r): r is { url: string; title: string; image: string } => r !== null);

  return c.json(results);
});
export default metadataRoute;
