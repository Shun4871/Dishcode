
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

   // Pythonサーバー(port:8000)をvalueそのままで叩く
   app.get("/recipe", async (c) => {
    try {
      // クエリパラメータを取得
      const queryParams = c.req.query();
  
      // 転送先のURL
      const targetServerUrl = "http://0.0.0.0:8000/api-endpoint";
  
      // fetch 時のタイムアウト処理は削除
      const response = await fetch(
        `${targetServerUrl}?${new URLSearchParams(queryParams)}`,
        { method: "GET" }
      );
      console.log(`Response status: ${response.status}`);
  
      // ストリームからの受信のためのリーダーとテキストデコーダーの準備
      if (!response.body) {
        throw new Error("Response body is null");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let receivedText = "";
      let completeRecipeData: any = null;
  
      // 最大待機時間 10 分 (600,000ms)
      const maxWaitTime = 10 * 60 * 100000000;
      const startTime = Date.now();
  
      // 安全に JSON をパースするヘルパー
      const safeJSONParse = (str: string): any => {
        try {
          return JSON.parse(str);
        } catch (error) {
          console.error("JSON parse error for string:", str, error);
          return null;
        }
      };
  
      // ストリームからデータを逐次読み込み、Markdown のコードブロック内の JSON を抽出する
      while (true) {
        // タイムアウトチェック
        if (Date.now() - startTime > maxWaitTime) {
          console.error("Timeout reached after 10 minutes waiting for complete recipe data.");
          break;
        }
  
        const { done, value } = await reader.read();
        if (done) break;
        receivedText += decoder.decode(value, { stream: true });
  
        // Markdown の ```json ... ``` ブロックを正規表現で抽出
        const regex = /```json\s*([\s\S]*?)\s*```/g;
        let match;
        while ((match = regex.exec(receivedText)) !== null) {
          const candidate = match[1].trim();
          // JSON っぽいかどうかを簡易チェック
          if (!candidate.startsWith("{") || !candidate.endsWith("}")) {
            console.log("Skipping candidate that doesn't look like JSON:", candidate);
            continue;
          }
          const parsed = safeJSONParse(candidate);
          if (parsed) {
            // 直接 url1,url2,url3 があるか、urls 配列で3つ以上あるかチェック
            if (
              (parsed.url1 && parsed.url2 && parsed.url3) ||
              (Array.isArray(parsed.urls) && parsed.urls.length >= 3)
            ) {
              completeRecipeData = parsed;
              break;
            } else {
              console.log("Incomplete recipe data found, waiting for additional response:", parsed);
            }
          }
        }
        if (completeRecipeData) break;
      }
  
      // 完全なレシピデータが取得できなかった場合はエラーログを残す
      if (!completeRecipeData) {
        console.error("No complete recipe data (with 3 URLs) was received from target server.");
        return c.json({ error: "Incomplete recipe data received" }, 503);
      }
  
      // 抽出したデータから URL を整形して取得
      let fullUrl1, fullUrl2, fullUrl3;
      try {
        if (completeRecipeData.url1 && completeRecipeData.url2 && completeRecipeData.url3) {
          fullUrl1 = new URL(completeRecipeData.url1).href;
          fullUrl2 = new URL(completeRecipeData.url2).href;
          fullUrl3 = new URL(completeRecipeData.url3).href;
        } else if (Array.isArray(completeRecipeData.urls)) {
          const urls = completeRecipeData.urls;
          fullUrl1 = urls[0] ? new URL(urls[0]).href : "";
          fullUrl2 = urls[1] ? new URL(urls[1]).href : "";
          fullUrl3 = urls[2] ? new URL(urls[2]).href : "";
        } else {
          console.error("Invalid recipe format:", completeRecipeData);
          return c.json({ error: "Invalid recipe format from target server" }, 503);
        }
      } catch (error) {
        console.error("Failed to extract URL:", error);
        return c.json({ error: "Failed to extract URL from response data" }, 502);
      }
  
      console.log("Hono Final response:", { url1: fullUrl1, url2: fullUrl2, url3: fullUrl3 });
      return c.json({ url1: fullUrl1, url2: fullUrl2, url3: fullUrl3 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Unexpected server error:", errorMessage);
      return c.json({ error: "Internal server error", details: errorMessage }, 503);
    }
  });
  


    
    // app.get("/recipe", async (c) => {
    //     return c.json({
    //     url1: "https://cookpad.com/jp/recipes/17662797",
    //     url2: "https://mi-journey.jp/foodie/80782/",
    //     url3: "https://delishkitchen.tv/recipes/147726740259602726"
    //     });
    // });


export default {
    port: 8080,
    fetch: app.fetch
} 