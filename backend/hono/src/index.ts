import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { drizzle } from 'drizzle-orm/d1';

import { user } from './db/schema';
import { favorite } from './db/schema';

import webhookRoutes from './routes/webhooks'
import metadataRoute from './routes/metadata';
import api from './routes/api';




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
// 👇 APIルートを `/api` にマウント
app.route('/api', api)

app.route('/', metadataRoute);

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


/////
/////以下開発用
/////

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
  try {
    const users = await db.select().from(user).all();
    return c.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return c.json({ message: "Internal server error", error: error.message }, 500);
  }
});

//お気に入りデータベース取得
app.get('/favorite', async (c) => {
  const db = drizzle(c.env.DB);
  try {
    const favorites = await db.select().from(favorite).all();
    return c.json(favorites);
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return c.json({ message: "Internal server error", error: error.message }, 500);
  }
});

export default app
