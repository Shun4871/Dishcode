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
  GEMINI_API_KEY: string;
  PERPLEXITY_API_KEY: string;
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

// app.get('/recipe', async (c) => {
//   try {
//     // 1) ユーザー認証トークンがあれば取得（未ログインの場合は userId は undefined）
//     const auth = getAuth(c);
//     const clerkId = auth?.userId;  // ログイン済みなら文字列、未ログインなら undefined

//     // 2) Drizzle で DB 接続
//     const db = drizzle(c.env.DB);

//     // 3) クエリパラメータを取得 & パース
//     const query = c.req.query() as Record<string, string>;
//     const people         = parseInt(query.people        ?? '0', 10);
//     const oven           = query.oven          === 'true' ? 1 : 0;
//     const hotplate       = query.hotplate      === 'true' ? 1 : 0;
//     const time           = parseInt(query.time          ?? '0', 10);
//     const toaster        = query.toaster       === 'true' ? 1 : 0;

//     // 4) （任意）ログイン済みユーザーのみ検索ログを保存
//     if (clerkId) {
//       await db.insert(searchLog).values([{
//         clerkId,
//         people,
//         oven,
//         hotplate,
//         time,
//         toaster,
//         createdAt: Date.now(),
//       }]);
//     }

//     // 5) 同じパラメータで外部 API を呼び出し
//     const params = new URLSearchParams(query);
//     const baseUrl = c.env.EXTERNAL_API_URL;
//     if (!baseUrl) {
//       return c.json({ error: 'External API URL not configured' }, 500);
//     }

//     const target = `${baseUrl}/api/search-agent-super-cool?${params.toString()}`;
//     const resp = await fetch(target, { method: 'GET' });
//     if (!resp.ok) {
//       return c.json(
//         { error: 'External API fetch failed', status: resp.status },
//         502
//       );
//     }

//     // 6) 結果をパースして返却
//     const data = await resp.json() as {
//       url1?: string;
//       url2?: string;
//       url3?: string;
//     };

//     const { url1, url2, url3 } = data;
//     if (
//       typeof url1 !== 'string' ||
//       typeof url2 !== 'string' ||
//       typeof url3 !== 'string'
//     ) {
//       return c.json(
//         { error: 'Invalid external API response format', data },
//         503
//       );
//     }

//     return c.json({ url1, url2, url3 });

//   } catch (e: any) {
//     console.error(e);
//     return c.json(
//       { error: 'Internal Server Error', details: e.message || String(e) },
//       500
//     );
//   }
// });

// 


app.get('/recipe', async (c) => {
  try {
    console.log('🔐 認証チェック開始')
    const auth = getAuth(c)
    const clerkId = auth?.userId
    console.log('👤 clerkId:', clerkId)

    const db = drizzle(c.env.DB)

    const query = c.req.query() as Record<string, string>
    const people   = parseInt(query.people        ?? '0', 10)
    const oven     = query.oven     === 'true' ? 1 : 0
    const hotplate = query.hotplate === 'true' ? 1 : 0
    const time     = parseInt(query.time         ?? '0', 10)
    const toaster  = query.toaster  === 'true' ? 1 : 0
    const selected = decodeURIComponent(query.selected ?? '')

    console.log('🔍 クエリ:', { selected, people, oven, hotplate, time, toaster })

    if (clerkId) {
      console.log('📝 検索ログを保存します')
      await db.insert(searchLog).values([{
        clerkId,
        people,
        oven,
        hotplate,
        time,
        toaster,
        createdAt: Date.now(),
      }])
    }

    // プロンプトの作成
    // 使用不可な調理器具をリストアップ（true のときは使えるので false のみ対象）
    const ngTools: string[] = []
    if (!oven) ngTools.push('オーブン')
    if (!hotplate) ngTools.push('ホットプレート')

    const toolCondition = ngTools.length > 0
      ? `- ${ngTools.join('、')}を使わないこと`
      : ''  // 両方 true のときは条件なし

    const prompt = `
    以下の条件に合うレシピを教えてください。日本のレシピサイトのURLを5つください。必ずリンクで、JSON形式で出力してください。

    - 材料: ${selected}
    - 人数: ${people}人
    - 調理時間: ${time}分以内
    - ${toolCondition}
    - 対象サイト: DELISH KITCHEN、クックパッド, レシピブログ、楽天レシピ、E・レシピ、Nadia、kurashiru(3つとも違うサイトから選んでください)
    形式：[{"title":"レシピ名","url":"https://〜"}]
    `.trim()

    console.log('🧠 Perplexity に送るプロンプト:', prompt)

    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        max_tokens: 512,
        temperature: 0.0,
        messages: [
          {
            role: 'system',
            content: 'あなたはJSON形式でのみ回答するアシスタントです。余計な説明はせず、ユーザーの指示に従って正確に出力してください。',
          },
          {
            role: 'user',
            content: prompt,
          }
        ]
      })
    })

    console.log('🌐 Perplexity 応答ステータス:', perplexityRes.status)

    if (!perplexityRes.ok) {
      console.error('⚠️ Perplexity API からの応答エラー')
      return c.json({ error: 'Failed to fetch from Perplexity', status: perplexityRes.status }, 502)
    }

    const perplexityJson: any = await perplexityRes.json()
    const content = perplexityJson.choices?.[0]?.message?.content
    console.log('🧾 Perplexity 応答 content:', content)

    if (!content) {
      console.error('⚠️ Perplexity の content が空')
      return c.json({ error: 'No content in Perplexity response', perplexityJson }, 503)
    }

    let parsed: { title: string, url: string }[]
    try {
      parsed = JSON.parse(content)
      console.log('✅ JSON パース成功:', parsed)
    } catch (e) {
      console.error('❌ JSON パース失敗', content)
      return c.json({ error: 'Failed to parse JSON from Perplexity content', raw: content }, 503)
    }

    const urls = parsed
      .filter(item => typeof item.url === 'string')
      .slice(0, 5
      )
      .map(item => item.url)

    console.log('📦 抽出されたURL:', urls)

    return c.json({
      url1: urls[0] ?? null,
      url2: urls[1] ?? null,
      url3: urls[2] ?? null,
      url4: urls[3] ?? null,
      url5: urls[4] ?? null,
    })

  } catch (e: any) {
    console.error('🔥 予期せぬエラー:', e)
    return c.json({ error: 'Internal Server Error', details: e.message || String(e) }, 500)
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
      time,
      toaster,
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
