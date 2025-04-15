// src/routes/api.ts

import { Hono } from 'hono';
import { getAuth } from '@hono/clerk-auth';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { user, favorite } from '../db/schema';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// ★ 共通で使用するメタデータ取得関数 ★
const fetchMetadataForUrl = async (url: string) => {
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
    console.error(`Error fetching metadata for ${url}:`, e);
    return { url, title: '取得失敗', image: '' };
  }
};

const fetchMetadataForUrls = async (urls: string[]) => {
  return await Promise.all(urls.map(fetchMetadataForUrl));
};

// ==========================
// お気に入り登録エンドポイント
// POST /api/favorite
// ==========================
app.post('/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);

  const db = drizzle(c.env.DB);
  const { recipeURL } = await c.req.json();
  if (!recipeURL) return c.json({ message: 'Recipe URL is required' }, 400);

  // DB内のユーザーを認証情報(clerkId)で検索
  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, auth.userId))
    .limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 405);

  await db.insert(favorite).values({ userId: userRow.id, recipeURL });
  return c.json({ message: 'Favorite added' });
});

// ==========================
// お気に入り削除エンドポイント
// DELETE /api/favorite
// ==========================
app.delete('/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);

  const db = drizzle(c.env.DB);
  const { recipeURL } = await c.req.json();
  if (!recipeURL) return c.json({ message: 'Recipe URL is required' }, 400);

  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, auth.userId))
    .limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 404);

  await db
    .delete(favorite)
    .where(and(eq(favorite.recipeURL, recipeURL), eq(favorite.userId, userRow.id)))
    .execute();

  return c.json({ message: 'Favorite deleted' });
});

// ======================================
// お気に入り取得エンドポイント
// GET /api/favorite/:clerkId
// ユーザーのお気に入りの recipeURL 一覧から、メタデータを取得
// ======================================
app.get('/favorite/:clerkId', async (c) => {
  const auth = getAuth(c);
  const clerkId = c.req.param('clerkId');
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);
  if (auth.userId !== clerkId) return c.json({ message: 'Forbidden' }, 403);

  const db = drizzle(c.env.DB);
  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, clerkId))
    .limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 404);

  const favorites = await db
    .select()
    .from(favorite)
    .where(eq(favorite.userId, userRow.id))
    .all();

  // お気に入りレコードから recipeURL の一覧を作成
  const urlList = favorites.map(fav => fav.recipeURL);

  // 共通関数でメタデータ取得
  const favoritesWithMeta = await fetchMetadataForUrls(urlList);

  return c.json(favoritesWithMeta);
});

export default app;