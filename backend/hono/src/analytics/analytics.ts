import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { user, searchLog, favorite } from '../db/schema'
import * as XLSX from 'xlsx'

// --- ユーティリティ ---
const getDb = (c: any) => drizzle(c.env.DB)
const toISO = (ts: number | undefined) => ts ? new Date(ts).toISOString() : null
const calcAge = (birthday: string | null): number | null => {
  if (!birthday) return null
  const ageMs = Date.now() - new Date(birthday).getTime()
  return Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25))
}

// Boolean フラグ別カウント取得
async function getBoolCounts(db: ReturnType<typeof drizzle>) {
  const totalRec = await db.select({ cnt: sql`COUNT(*)` }).from(searchLog).all()
  const total = Number(totalRec[0]?.cnt ?? 0)
  const flags = ['oven','hotplate','mixer','toaster','pressurecooker'] as const
  const summary: Record<string, {true:number,false:number}> = {}
  for (const flag of flags) {
    const cntRec = await db
      .select({ cnt: (searchLog as any)[flag].count() })
      .from(searchLog)
      .where((searchLog as any)[flag].eq(1))
      .all()
    const cnt = Number(cntRec[0]?.cnt ?? 0)
    summary[flag] = { true: cnt, false: total - cnt }
  }
  return summary
}

// 年代帯・性別別カウント取得
async function getDemoCounts(db: ReturnType<typeof drizzle>) {
  const rows = await db
    .select({ birthday: user.birthday, gender: user.gender })
    .from(searchLog)
    .leftJoin(user, eq(user.clerkId, searchLog.clerkId))
    .all()
  const ageGroups: Record<string, number> = {}
  const genders: Record<string, number> = {}
  for (const r of rows) {
    const ag = r.birthday ? `${Math.floor(calcAge(r.birthday)!/10)*10}s` : 'unknown'
    ageGroups[ag] = (ageGroups[ag] || 0) + 1
    const g = r.gender || 'unspecified'
    genders[g] = (genders[g] || 0) + 1
  }
  return { ageGroups, genders }
}

const analytics = new Hono<{ Bindings: { DB: D1Database } }>()


// お気に入り分析
analytics.get('favorite', async c => {
  const db = getDb(c)
  const rows = await db
    .select({
      id: favorite.id,
      recipeURL: favorite.recipeURL,
      createdAt: favorite.createdAt,
      user: {
        id: favorite.userId,
        clerkId: user.clerkId,
        email: user.email,
        birthday: user.birthday,
        gender: user.gender,
      }
    })
    .from(favorite)
    .leftJoin(user, eq(user.id, favorite.userId))
    .orderBy(sql`${favorite.createdAt} DESC`)
    .limit(100)
  const result = rows.map(r => ({
    favId: r.id,
    recipeURL: r.recipeURL,
    createdAt: toISO(r.createdAt),
    user: {
      userId: r.user.id,
      clerkId: r.user.clerkId,
      email: r.user.email,
      age: calcAge(r.user.birthday),
      gender: r.user.gender,
    }
  }))
  return c.json(result)
})

// 検索分析
analytics.get('/search', async c => {
  const db = getDb(c)
  const rows = await db
    .select({
      id: searchLog.id,
      params: sql`json_object(
        'people', ${searchLog.people},
        'oven', ${searchLog.oven},
        'hotplate', ${searchLog.hotplate},
        'mixer', ${searchLog.mixer},
        'time', ${searchLog.time},
        'toaster', ${searchLog.toaster},
        'pressurecooker', ${searchLog.pressurecooker}
      )`,
      createdAt: searchLog.createdAt,
      user: {
        clerkId: searchLog.clerkId,
        email: user.email,
        birthday: user.birthday,
        gender: user.gender,
      }
    })
    .from(searchLog)
    .leftJoin(user, eq(user.clerkId, searchLog.clerkId))
    .orderBy(sql`${searchLog.createdAt} DESC`)
    .limit(100)
  const result = rows.map(r => {
    const p = JSON.parse((r as any).params)
    return {
      logId: r.id,
      params: p,
      createdAt: toISO(r.createdAt),
      user: {
        clerkId: r.user.clerkId,
        email: r.user.email,
        age: calcAge(r.user.birthday),
        gender: r.user.gender,
      }
    }
  })
  return c.json(result)
})

// ユーザー一覧
analytics.get('/users', async c => {
  const db = getDb(c)
  const rows = await db
    .select({
      clerkId: user.clerkId,
      email: user.email,
      age: sql`(strftime('%Y', 'now') - substr(${user.birthday},1,4))`,
      gender: user.gender
    })
    .from(user)
    .orderBy(sql`${user.clerkId} DESC`)
    .limit(100)
  return c.json(rows)
})

// CSV エクスポート
analytics.get('/csv', async c => {
  const db = getDb(c)
  const rows = await db.select().from(searchLog).all()
  const header = ['clerkId','people','oven','hotplate','mixer','time','toaster','pressurecooker','createdAt']
  const boolStr = (b: number) => b ? 'true':'false'
  const lines = rows.map(r => [
    r.clerkId,
    r.people,
    boolStr(r.oven),
    boolStr(r.hotplate),
    boolStr(r.mixer),
    r.time,
    boolStr(r.toaster),
    boolStr(r.pressurecooker),
    toISO(r.createdAt)
  ].join(','))
  const csv = [header.join(','), ...lines].join('\n')
  c.header('Content-Type','text/csv')
  c.header('Content-Disposition','attachment; filename=search_log.csv')
  return c.body(csv)
})

// Excel エクスポート
analytics.get('/xlsx', async c => {
  const db = getDb(c)
  const [searchRows, favRows, userRows] = await Promise.all([
    db.select().from(searchLog).all(),
    db.select().from(favorite).all(),
    db.select().from(user).all()
  ])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(searchRows), 'SearchLogs')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(favRows), 'Favorites')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(userRows), 'Users')
  const buf = XLSX.write(wb, { bookType:'xlsx', type:'array' })
  c.header('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition','attachment; filename=analytics.xlsx')
  return c.body(new Uint8Array(buf))
})

// ダッシュボード HTML
analytics.get('/dashboard', (c) =>{
    const html = String.raw`<!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8"/>
    <title>検索ログ Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body>
    <h1>検索ログ Dashboard</h1>
    <canvas id="boolChart" width="600" height="400"></canvas>
    <canvas id="ageChart"  width="400" height="400"></canvas>
    <canvas id="genderChart" width="400" height="400"></canvas>
    <script>
      (async () => {
        // 1) Boolean フラグ集計 (CSV)
        const resCsv = await fetch('/analytics/csv')
        const text = await resCsv.text()
        const [headerLine, ...lines] = text.trim().split('\n')
        const labels = headerLine.split(',')
        const counts = {}
        labels.forEach(col => { counts[col] = { true:0, false:0 } })
        lines.forEach(row => {
          const vals = row.split(',')
          vals.forEach((v,i) => { counts[labels[i]][v]++ })
        })
        // 2) Boolean 棒グラフ描画
        const ctxBool = document.getElementById('boolChart').getContext('2d')
        new Chart(ctxBool, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'True',  data: labels.map(c => counts[c].true) },
              { label: 'False', data: labels.map(c => counts[c].false) }
            ]
          },
          options: { scales: { y: { beginAtZero: true } } }
        })
  
        // 3) ユーザー分析 (年代 & 性別)
        const resUsers = await fetch('/analytics/users')
        const users = await resUsers.json()
        const ageCounts = {}, genderCounts = {}
        users.forEach(u => {
          const ag = u.age !== null ? Math.floor(u.age/10)*10 + 's' : 'unknown'
          ageCounts[ag] = (ageCounts[ag]||0) + 1
          const g = u.gender || 'unspecified'
          genderCounts[g] = (genderCounts[g]||0) + 1
        })
        // 4) 年代帯棒グラフ
        const ctxAge = document.getElementById('ageChart').getContext('2d')
        new Chart(ctxAge, {
          type: 'bar',
          data: {
            labels: Object.keys(ageCounts),
            datasets: [{ label: '人数', data: Object.values(ageCounts) }]
          },
          options: { scales: { y: { beginAtZero: true } } }
        })
        // 5) 性別棒グラフ
        const ctxGen = document.getElementById('genderChart').getContext('2d')
        new Chart(ctxGen, {
          type: 'bar',
          data: {
            labels: Object.keys(genderCounts),
            datasets: [{ label: '人数', data: Object.values(genderCounts) }]
          },
          options: { scales: { y: { beginAtZero: true } } }
        })
      })()
    </script>
  </body>
  </html>`
    return c.html(html)
  })
  

export default analytics