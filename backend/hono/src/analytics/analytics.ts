// src/routes/analytics.ts
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { sql, eq } from 'drizzle-orm';
import { user, searchLog ,favorite} from '../db/schema';



// 年齢計算関数はそのまま
function calcAge(birthday: string | null): number | null {
    if (!birthday) return null
    const birth = new Date(birthday).getTime()
    const diff = Date.now() - birth
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }
  
  const analytics = new Hono<{ Bindings: { DB: D1Database } }>()

  analytics.get('/favorite-analytics', async (c) => {
    const db = drizzle(c.env.DB);
  
    // 直近100件のお気に入り＋ユーザー情報を取得
    const rows = await db
      .select({
        favId:     favorite.id,
        recipeURL: favorite.recipeURL,
        createdAt: favorite.createdAt,      // 追加した場合
        userId:    favorite.userId,
        clerkId:   user.clerkId,
        email:     user.email,
        birthday:  user.birthday,
        gender:    user.gender,
      })
      .from(favorite)
      .leftJoin(user, eq(user.id, favorite.userId))
      .orderBy(sql`${favorite.createdAt} desc`)  // SQL テンプレートで降順指定
      .limit(100);
  
    // フォーマットして返却
    const result = rows.map((r) => ({
      favId:     r.favId,
      recipeURL: r.recipeURL,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      user: {
        userId:  r.userId,
        clerkId: r.clerkId,
        email:   r.email,
        age:     calcAge(r.birthday),
        gender:  r.gender,
      },
    }));
  
    return c.json(result);
  });
  
  analytics.get('/search-analytics', async (c) => {
    const db = drizzle(c.env.DB)
  
    const rows = await db
      .select({
        logId:          searchLog.id,
        people:         searchLog.people,
        oven:           searchLog.oven,
        hotplate:       searchLog.hotplate,
        mixer:          searchLog.mixer,
        time:           searchLog.time,
        toaster:        searchLog.toaster,
        pressurecooker: searchLog.pressurecooker,
        createdAt:      searchLog.createdAt,
        clerkId:        searchLog.clerkId,
        email:          user.email,
        birthday:       user.birthday,
        gender:         user.gender,
      })
      .from(searchLog)
      .leftJoin(user, eq(user.clerkId, searchLog.clerkId))
      // ↓ SQL テンプレートで DESC を含める
      .orderBy(sql`${searchLog.createdAt} desc`)
      .limit(100)
  
    const result = rows.map((row) => ({
      logId: row.logId,
      params: {
        people:         row.people,
        oven:           !!row.oven,
        hotplate:       !!row.hotplate,
        mixer:          !!row.mixer,
        time:           row.time,
        toaster:        !!row.toaster,
        pressurecooker: !!row.pressurecooker,
      },
      createdAt: new Date(row.createdAt).toISOString(),
      user: {
        clerkId: row.clerkId,
        email:   row.email,
        age:     calcAge(row.birthday),
        gender:  row.gender,
      },
    }))
  
    return c.json(result)
  })

export default analytics;
