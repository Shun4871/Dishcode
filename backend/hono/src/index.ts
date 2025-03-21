
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { Prisma, PrismaClient } from "@prisma/client";
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { WebhookEvent } from '@clerk/backend'
import { Webhook } from 'svix'

import { z } from 'zod'
// import { zValidate } from '@hono/zod-validate'



const app = new Hono()

const prisma = new PrismaClient();


const db = prisma


app.use('*', cors({ origin: 'http://localhost:3000' }))
// CORS 対応（必要に応じて）
app.use('*', async (c, next) => {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Headers', '*');
    await next();
  });

    app.post("/webhook/clerk", clerkMiddleware(), (c) => {
        const SIGNING_SECRET = process.env.SIGNING_SECRET

        if (!SIGNING_SECRET) {
            throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
        }
        const wh = new Webhook(SIGNING_SECRET)
        const svix_id = c.req.header('svix-id')
        const svix_timestamp = c.req.header('svix-timestamp')
        const svix_signature = c.req.header('svix-signature')
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return c.json({ message: 'Error: Missing Svix headers' }, {
                status: 400,
            })
        }
        const payload =  c.req.json()
        const body = JSON.stringify(payload)

        let evt: WebhookEvent

        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            }) as WebhookEvent
        } catch (err) {
            console.error('Error: Could not verify webhook:', err)
            return c.json({ message: 'Error: Verification error' }, {
                status: 400,
            })
        }

        if (evt.type === 'user.created') {
            prisma.user.create({
                data: {
                    clerk_id: evt.data.id,
                }
            })
            return c.json({ message: 'User created successfully' }, {
                status: 200
            })
        }

        if (evt.type === 'user.deleted') {
            prisma.user.delete({
                where: {
                    clerk_id: evt.data.id,
                }
            })
            return c.json({ message: 'User deleted successfully' }, {
                status: 200
            })
        }
        return c.json({ message: 'Error: Invalid event type' }, {
            status: 400
        })
    })

    // POST /search エンドポイント
app.post('/search', async (c) => {
    // クライアントから JSON ボディで { url: string } を受け取る
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

    //Userのお気に入りを押した時の処理
    app.post('/favorite', async (c) => {
        try {
            // Clerk認証情報を取得
            const auth = getAuth(c)
            if (!auth?.userId) {
                return c.json({ error: 'Unauthorized' }, 401)
            }
    
            // `clerk_id` から `user_id` を取得
            const user = await prisma.user.findUnique({
                where: { clerk_id: auth.userId },
            })
    
            if (!user) {
                return c.json({ error: 'User not found' }, 404)
            }
    
            // リクエストボディを取得
            const body = await c.req.json()
            const { favorite_url } = body
    
            if (!favorite_url) {
                return c.json({ error: 'favorite_url is required' }, 400)
            }
    
            // お気に入りをデータベースに追加
            const favorite = await prisma.favorite.create({
                data: {
                    user_id: user.user_id,
                    favorite_url: String(favorite_url),
                },
            })
    
            return c.json({ message: 'Favorite added successfully', favorite })
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 500)
        }
    })
    
    // お気に入りを削除
    app.delete('/favorite', async (c) => {
        try {
            // Clerk認証情報を取得
            const auth = getAuth(c)
            if (!auth?.userId) {
                return c.json({ error: 'Unauthorized' }, 401)
            }
    
            // `clerk_id` から `user_id` を取得
            const user = await prisma.user.findUnique({
                where: { clerk_id: auth.userId },
            })
    
            if (!user) {
                return c.json({ error: 'User not found' }, 404)
            }
    
            // リクエストボディを取得
            const body = await c.req.json()
            const { favorite_url } = body
    
            if (!favorite_url) {
                return c.json({ error: 'favorite_url is required' }, 400)
            }
    
            // お気に入りを削除
            const deletedFavorite = await prisma.favorite.deleteMany({
                where: {
                    user_id: user.user_id,
                    favorite_url: String(favorite_url),
                },
            })
    
            if (deletedFavorite.count === 0) {
                return c.json({ error: 'No matching favorite found' }, 404)
            }
    
            return c.json({ message: 'Favorite deleted successfully' })
        } catch (error) {
            console.error(error)
            return c.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 500)
        }
    })

    // //Pythonサーバー(port:8000)をvalueそのままで叩く
    // app.get("/recipe", async (c) => {
    //     try {
    //         // クエリパラメータを取得
    //         const queryParams = c.req.query()
    
    //         // 転送先のURL（適宜変更）
    //         const targetServerUrl = " http://0.0.0.0:8000/api-endpoint"
    
    //         // 転送リクエストを送信
    //         const response = await fetch(`${targetServerUrl}?${new URLSearchParams(queryParams)}`, {
    //             method: 'GET',
    //         })
    
    //         // HTTPステータスコードのチェック
    //         if (!response.ok) {
    //             return c.json({ error: "Failed to fetch data from target server" }, 500)
    //         }
    
    //         // JSONデータとしてレスポンスを取得
    //         const data: unknown = await response.json()
    
    //         // nullチェック
    //         if (data === null || typeof data !== "object") {
    //             return c.json({ error: "Invalid response format from target server" }, 501)
    //         }
    
    //         // `data` を型アサーション
    //         const responseData = data as { url1?: string; url2?: string; url3?: string }
    
    //         // 必須プロパティの存在チェック
    //         if (!responseData.url1 || !responseData.url2 || !responseData.url3) {
    //             return c.json({ error: "Invalid response format from target server" }, 502)
    //         }
    
    //         return c.json(responseData)
    //     } catch (error) {
    //         // `error` が unknown 型にならないように処理
    //         const errorMessage = error instanceof Error ? error.message : "Unknown error"
    //         return c.json({ error: "Internal server error", details: errorMessage }, 503)
    //     }
    // })



    //モック
    app.get("/recipe", async (c) => {
        // 10秒待つ
        await new Promise((resolve) => setTimeout(resolve, 10000));
      
        return c.json({
          url1: "https://delishkitchen.tv/recipes/233678306187149791",
          url2: "https://daidokolog.pal-system.co.jp/recipe/1980",
          url3: "https://recipe.rakuten.co.jp/recipe/1410014917/"
        });
      });
      


export default {
    port: 8080,
    fetch: app.fetch
} 