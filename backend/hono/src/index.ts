import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import { user } from './db/schema';
import { favorite } from './db/schema';

import webhookRoutes from './routes/webhooks'
import metadataRoute from './routes/metadata';




type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();


app.use('*', cors());

app.get('/', (c) => {
  return c.text('Hello DishCode!')
})

app.use('*', clerkMiddleware())

// 👇 Webhookルートを `/webhooks` にマウント
app.route('/webhooks', webhookRoutes)

// ログイン確認API
app.get('/login', (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: 'Not logged in' }, 401);
  }
  return c.json({ message: 'Logged in', userId: auth.userId });
});

// 全ユーザー取得
app.get('/users', async (c) => {
  const db = drizzle(c.env.DB);
  const users = await db.select().from(user).all();
  return c.json(users);
});

//お気に入りデータベース取得
app.get('/favorite', async (c) => {
  const db = drizzle(c.env.DB);
  const favorites = await db.select().from(favorite).all();
  return c.json(favorites);
});

// お気に入り登録
app.post('/api/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: 'Not logged in' }, 401);
  }

  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { recipeURL } = body;

  if (!recipeURL) {
    return c.json({ message: 'Recipe URL is required' }, 400);
  }

  // Clerk IDからuserを取得
  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, auth.userId))
    .limit(1);

  if (!userRow) {
    return c.json({ message: 'User not found' }, 404);
  }

  // insert
  await db.insert(favorite).values({
    userId: userRow.id,
    recipeURL,
  });

  return c.json({ message: 'Favorite added' });
});
// お気に入り削除
app.delete('/api/favorite', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: 'Not logged in' }, 401);
  }

  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { recipeURL } = body;

  if (!recipeURL) {
    return c.json({ message: 'Recipe URL is required' }, 400);
  }

  // Clerk IDからuserを取得
  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, auth.userId))
    .limit(1);

  if (!userRow) {
    return c.json({ message: 'User not found' }, 404);
  }

  // ユーザーに紐づくお気に入りを削除
  await db
    .delete(favorite)
    .where(
      and(eq(favorite.recipeURL, recipeURL), eq(favorite.userId, userRow.id))
    )
    .execute();

  return c.json({ message: 'Favorite deleted' });
});

//お気に入り取得
app.get('/favorite/:clerkId', async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ message: 'Not logged in' }, 401);
  }

  const requestedClerkId = c.req.param('clerkId');

  // 自分以外のユーザーのお気に入りを見れないように
  if (auth.userId !== requestedClerkId) {
    return c.json({ message: 'Forbidden' }, 403);
  }

  const db = drizzle(c.env.DB);

  // clerk_id → user.id（数値）を取得
  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.clerkId, requestedClerkId))
    .limit(1);

  if (!userRecord) {
    return c.json({ message: 'User not found' }, 404);
  }

  const favorites = await db
    .select()
    .from(favorite)
    .where(eq(favorite.userId, userRecord.id))
    .all();

  const favoritesWithMeta = await Promise.all(
    favorites.map(async (fav) => {
      try {
        const res = await fetch(fav.recipeURL);
        const html = await res.text();

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "タイトルが取得できませんでした";

        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
        const image = ogImageMatch ? ogImageMatch[1].trim() : "";

        return {
          ...fav,
          title,
          image,
        };
      } catch (error: any) {
        console.error(`Error fetching metadata for ${fav.recipeURL}:`, error);
        return {
          ...fav,
          title: "タイトル取得エラー",
          image: "",
          error: error.message,
        };
      }
    })
  );

  return c.json(favoritesWithMeta);
});


app.get("/recipe", async (c) => {
  try {
      // クエリパラメータを取得
      const queryParams = c.req.query()

      // 転送先のURL（適宜変更）
      const targetServerUrl = " http://0.0.0.0:8000/api-endpoint"

      // 転送リクエストを送信
      const response = await fetch(`${targetServerUrl}?${new URLSearchParams(queryParams)}`, {
          method: 'GET',
      })

      // HTTPステータスコードのチェック
      if (!response.ok) {
          return c.json({ error: "Failed to fetch data from target server" }, 500)
      }

      // JSONデータとしてレスポンスを取得
      const data: unknown = await response.json()

      // nullチェック
      if (data === null || typeof data !== "object") {
          return c.json({ error: "Invalid response format from target server" }, 501)
      }

      // `data` を型アサーション
      const responseData = data as { url1?: string; url2?: string; url3?: string }

      // 必須プロパティの存在チェック
      if (!responseData.url1 || !responseData.url2 || !responseData.url3) {
          return c.json({ error: "Invalid response format from target server" }, 502)
      }

      return c.json(responseData)
  } catch (error) {
      // `error` が unknown 型にならないように処理
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return c.json({ error: "Internal server error", details: errorMessage }, 503)
  }
})


app.get('/recipe-test', async (c) => {
  const url1 = "https://delishkitchen.tv/recipes/233678306187149791";
  const url2 = "https://delishkitchen.tv/recipes/398816650859643387";
  const url3 = "https://recipe.rakuten.co.jp/recipe/1410014917/";

  return c.json({ url1, url2, url3 });
}
);

app.route('/', metadataRoute);

app.post('/search', async (c) => {
  // クライアントから JSON ボディで { "url": string } を受け取る
  const data = await c.req.json();
  const { url } = data;

  if (!url) {
    return c.json({ error: 'URL が必要です' }, 400);
  }

  try {
    // URL の HTML を取得
    const res = await fetch(url);
    const html = await res.text();

    // <title> タグからタイトル抽出
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "タイトルが取得できませんでした";

    // <meta property="og:image"> タグから画像URL抽出
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["'](.*?)["']/i);
    const image = ogImageMatch ? ogImageMatch[1].trim() : "";

    return c.json({ title, image, url });
  } catch (error: any) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return c.json({ title: "タイトル取得エラー", image: "", error: error.message }, 500);
  }
});

export default app
