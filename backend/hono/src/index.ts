import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { drizzle } from 'drizzle-orm/d1';

import { user } from './db/schema';
import { favorite } from './db/schema';
import { searchLog } from './db/schema';

import webhookRoutes from './routes/webhooks'
import metadataRoute from './routes/metadata';
import api from './routes/api';
import analytics from './analytics/analytics';




export type Bindings = {
  DB: D1Database;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  EXTERNAL_API_URL: string;
};


const app = new Hono<{ Bindings: Bindings }>();


app.use('*', cors());

app.get('/', (c) => {
  return c.text('Hello DishCode!')
})

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

app.use('*', async (ctx, next) => {

  if (ctx.req.method === 'OPTIONS') {
    // CORSヘッダーなどを処理する他のミドルウェアがあるかもしれないのでnext()を呼ぶ
    // HonoがデフォルトでOPTIONSを処理する場合もある
    await next();
    return; // このミドルウェアの残りの処理は行わない
}


  const { CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY } = ctx.env;

  console.log('CLERK_SECRET_KEY:', CLERK_SECRET_KEY);
  console.log('CLERK_PUBLISHABLE_KEY:', CLERK_PUBLISHABLE_KEY);

  console.log('Clerkを使用して認証を行います。');

  await clerkMiddleware({
      secretKey: CLERK_SECRET_KEY,
      publishableKey: CLERK_PUBLISHABLE_KEY,
  })(ctx, async () => {});


  console.log('認証が完了しました。');



  await next();
});

// 👇 Webhookルートを `/webhooks` にマウント
app.route('/webhooks', webhookRoutes)
// 👇 APIルートを `/api` にマウント
app.route('/api', api)

app.route('/', metadataRoute);

app.route('/analytics', analytics);

app.get('/recipe', async (c) => {
  try {
    // 3) トークンを元にユーザー確認
    const auth = getAuth(c)
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const clerkId = auth.userId

    // 4) Drizzle で DB 接続
    const db = drizzle(c.env.DB)

    // 5) クエリパラメータを取得 & パース
    const query = c.req.query() as Record<string, string>
    const people        = parseInt(query.people       ?? '0', 10)
    const oven          = query.oven         === 'true' ? 1 : 0
    const hotplate      = query.hotplate     === 'true' ? 1 : 0
    const mixer         = query.mixer        === 'true' ? 1 : 0
    const time          = parseInt(query.time         ?? '0', 10)
    const toaster       = query.toaster      === 'true' ? 1 : 0
    const pressurecooker= query.pressurecooker === 'true' ? 1 : 0

    // 6) 検索ログを D1 に保存
    await db.insert(searchLog).values([{
      clerkId,
      people,
      oven,
      hotplate,
      mixer,
      time,
      toaster,
      pressurecooker,
      createdAt: Date.now(),
    }])

    // 7) 同じパラメータで外部 API を呼び出し
    const params = new URLSearchParams(query)
    const baseUrl = c.env.EXTERNAL_API_URL

    if (!baseUrl) {
      return c.json({ error: 'External API URL not configured' }, 500)
    }

      const target = `${baseUrl}/api/search-agent-super-cool?${params}`
    const resp = await fetch(target, { method: 'GET' })
    if (!resp.ok) {
      return c.json({ error: 'External API fetch failed', status: resp.status }, 502)
    }
    // レスポンス中身を一度ログ出力
    const data = await resp.json();
    console.log('外部 API からの応答:', data);

    const { url1, url2, url3 } = data as {
      url1?: string;
      url2?: string;
      url3?: string;
    };

    if (
      typeof url1 !== 'string' ||
      typeof url2 !== 'string' ||
      typeof url3 !== 'string'
    ) {
      return c.json(
        { error: 'Invalid external API response format', data },
        503
      );
    }
    console.log('返すレスポンス:', { url1, url2, url3 });
    return c.json({ url1, url2, url3 });
  } catch (e: any) {
    return c.json(
      { error: 'Internal Server Error', details: e.message || String(e) },
      500
    );
  }
})


app.get('/recipe-test', async (c) => {
  try {
    const auth = getAuth(c)
    // ここでは必ず userId が存在するので追加チェックは不要ですが念のため
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const clerkId = auth.userId

    // Drizzle インスタンス
    const db = drizzle(c.env.DB)

    // クエリパラメータ取得
    const p = new URL(c.req.url).searchParams
    const people        = parseInt(p.get('people')       ?? '0', 10)
    const oven          = p.get('oven')         === 'true' ? 1 : 0
    const hotplate      = p.get('hotplate')     === 'true' ? 1 : 0
    const mixer         = p.get('mixer')        === 'true' ? 1 : 0
    const time          = parseInt(p.get('time')         ?? '0', 10)
    const toaster       = p.get('toaster')      === 'true' ? 1 : 0
    const pressurecooker= p.get('pressurecooker') === 'true' ? 1 : 0

    // 検索ログを保存
    await db.insert(searchLog).values([{
      clerkId,
      people,
      oven,
      hotplate,
      mixer,
      time,
      toaster,
      pressurecooker,
      createdAt: Date.now(),
    }])

    // テスト用のURLを返却
    const url1 = "https://delishkitchen.tv/recipes/233678306187149791"
    const url2 = "https://delishkitchen.tv/recipes/398816650859643387"
    const url3 = "https://recipe.rakuten.co.jp/recipe/1410014917/"

    return c.json({ url1, url2, url3 })
  } catch (err: any) {
    // エラー内容を返してデバッグしやすく
    return c.json(
      { error: 'Internal Server Error', detail: err.message },
      500
    )
  }
})



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
