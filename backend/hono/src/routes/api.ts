// src/routes/api.ts

import { Hono } from 'hono';
import { getAuth } from '@hono/clerk-auth';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { user, favorite } from '../db/schema';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

// お気に入り登録
app.post('/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);

  const db = drizzle(c.env.DB);
  const { recipeURL } = await c.req.json();
  if (!recipeURL) return c.json({ message: 'Recipe URL is required' }, 400);

  const [userRow] = await db.select().from(user).where(eq(user.clerkId, auth.userId)).limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 405);

  await db.insert(favorite).values({ userId: userRow.id, recipeURL });
  return c.json({ message: 'Favorite added' });
});

// お気に入り削除
app.delete('/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);

  const db = drizzle(c.env.DB);
  const { recipeURL } = await c.req.json();
  if (!recipeURL) return c.json({ message: 'Recipe URL is required' }, 400);

  const [userRow] = await db.select().from(user).where(eq(user.clerkId, auth.userId)).limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 404);

  await db.delete(favorite).where(
    and(eq(favorite.recipeURL, recipeURL), eq(favorite.userId, userRow.id))
  ).execute();

  return c.json({ message: 'Favorite deleted' });
});

// お気に入り取得
app.get('/favorite/:clerkId', async (c) => {
  const auth = getAuth(c);
  const clerkId = c.req.param('clerkId');
  if (!auth?.userId) return c.json({ message: 'Not logged in' }, 401);
  if (auth.userId !== clerkId) return c.json({ message: 'Forbidden' }, 403);

  const db = drizzle(c.env.DB);
  const [userRow] = await db.select().from(user).where(eq(user.clerkId, clerkId)).limit(1);
  if (!userRow) return c.json({ message: 'User not found' }, 404);

  const favorites = await db.select().from(favorite).where(eq(favorite.userId, userRow.id)).all();

  const favoritesWithMeta = await Promise.all(
    favorites.map(async (fav) => {
      try {
        const res = await fetch(fav.recipeURL);
        const html = await res.text();
        const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() ?? "タイトル取得失敗";
        const image = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i)?.[1]?.trim() ?? "";
        return { ...fav, title, image };
      } catch (err: any) {
        return { ...fav, title: "タイトル取得エラー", image: "", error: err.message };
      }
    })
  );

  return c.json(favoritesWithMeta);
});

export default app

