import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql } from 'drizzle-orm'
import { user, searchLog, favorite } from '../db/schema'

// ユーティリティ関数
function calcAge(birthday: string | null): number | null {
  if (!birthday) return null
  const diff = Date.now() - new Date(birthday).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function ageGroup(age: number | null): string {
  if (age === null) return 'unknown'
  const decade = Math.floor(age / 10) * 10
  return `${decade}s`
}

const analytics = new Hono<{ Bindings: { DB: D1Database } }>()
analytics.use('*', cors())

// お気に入り分析
analytics.get('/favorite-analytics', async (c) => {
  const db = drizzle(c.env.DB)
  const rows = await db
    .select({ favId: favorite.id, recipeURL: favorite.recipeURL, createdAt: favorite.createdAt,
              userId: favorite.userId, clerkId: user.clerkId, email: user.email,
              birthday: user.birthday, gender: user.gender })
    .from(favorite)
    .leftJoin(user, eq(user.id, favorite.userId))
    .orderBy(sql`${favorite.createdAt} desc`)
    .limit(100)

  const result = rows.map(r => ({
    favId: r.favId,
    recipeURL: r.recipeURL,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    user: { userId: r.userId, clerkId: r.clerkId, email: r.email, age: calcAge(r.birthday), gender: r.gender }
  }))

  return c.json(result)
})

// 検索分析
analytics.get('/search-analytics', async (c) => {
  const db = drizzle(c.env.DB)
  const rows = await db
    .select({ logId: searchLog.id, people: searchLog.people, oven: searchLog.oven,
              hotplate: searchLog.hotplate, mixer: searchLog.mixer, time: searchLog.time,
              toaster: searchLog.toaster, pressurecooker: searchLog.pressurecooker,
              createdAt: searchLog.createdAt, clerkId: searchLog.clerkId,
              email: user.email, birthday: user.birthday, gender: user.gender })
    .from(searchLog)
    .leftJoin(user, eq(user.clerkId, searchLog.clerkId))
    .orderBy(sql`${searchLog.createdAt} desc`)
    .limit(100)

  const result = rows.map(r => ({
    logId: r.logId,
    params: { people: r.people, oven: !!r.oven, hotplate: !!r.hotplate,
              mixer: !!r.mixer, time: r.time, toaster: !!r.toaster,
              pressurecooker: !!r.pressurecooker },
    createdAt: new Date(r.createdAt).toISOString(),
    user: { clerkId: r.clerkId, email: r.email, age: calcAge(r.birthday), gender: r.gender }
  }))

  return c.json(result)
})

// ユーザー分析 (年代 & 性別含む)
analytics.get('/user-analytics', async (c) => {
  const db = drizzle(c.env.DB)
  const rows = await db
    .select({ userId: user.id, clerkId: user.clerkId, email: user.email,
              birthday: user.birthday, gender: user.gender })
    .from(user)
    .orderBy(sql`${user.id} desc`)
    .limit(100)

  const result = rows.map(r => ({
    userId: r.userId,
    clerkId: r.clerkId,
    email: r.email,
    age: calcAge(r.birthday),
    birthday: r.birthday,
    gender: r.gender,
  }))

  return c.json(result)
})

// CSV エクスポート
analytics.get('/search-export.csv', async (c) => {
  const db = drizzle(c.env.DB)
  const rows = await db.select().from(searchLog).all()
  const header = ['clerkId','people','oven','hotplate','mixer','time','toaster','pressurecooker','createdAt']
  const bool2str = (n: number) => n === 1 ? 'true' : 'false'

  const csv = [ header.join(',') ,
    ...rows.map(r => [r.clerkId, r.people, bool2str(r.oven), bool2str(r.hotplate),
      bool2str(r.mixer), r.time, bool2str(r.toaster), bool2str(r.pressurecooker),
      new Date(r.createdAt).toISOString()].join(','))
  ].join('\n')

  c.header('Content-Type', 'text/csv; charset=utf-8')
  c.header('Content-Disposition', 'attachment; filename="search_log.csv"')
  return c.body(csv)
})

// ダッシュボード HTML
analytics.get('/dashboard', (c) => c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>検索ログ ダッシュボード</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; padding:1rem; }
    .chart-container { width: 300px; display: inline-block; margin:1rem; vertical-align: top; }
    h2 { text-align: center; font-size: 1rem; }
  </style>
</head>
<body>
  <h1>検索ログ Dashboard</h1>
  <div id="bool-charts"></div>
  <div id="demo-charts">
    <div class="chart-container"><h2>年齢帯分布</h2><canvas id="ageChart"></canvas></div>
    <div class="chart-container"><h2>性別分布</h2><canvas id="genderChart"></canvas></div>
  </div>
  <script>
    async function fetchText(path) {
      const res = await fetch(path);
      if (!res.ok) throw new Error(path + ' ' + res.status);
      return res.text();
    }
    async function fetchJSON(path) {
      const res = await fetch(path);
      if (!res.ok) throw new Error(path + ' ' + res.status);
      return res.json();
    }
    function makePie(id, labels, data) {
      const ctx = document.getElementById(id);
      if (ctx) new Chart(ctx, { type: 'pie', data: { labels, datasets: [{ data }] } });
    }
    async function init() {
      // Boolean フラグ集計
      const text = await fetchText('/analytics/search-export.csv');
      const [headerLine, ...lines] = text.trim().split('\\n');
      const cols = headerLine.split(',');
      const counts: Record<string, {true:number,false:number}> = {} as any;
      cols.forEach(col => { counts[col] = { true: 0, false: 0 } });
      lines.forEach(line => {
        const vals = line.split(',');
        vals.forEach((v, i) => { counts[cols[i]][v as 'true' | 'false']++; });
      });
      const bc = document.getElementById('bool-charts');
      cols.forEach(col => {
        const div = document.createElement('div');
        div.className = 'chart-container';
        div.innerHTML = '<h2>' + col + '</h2><canvas id="' + col + 'Chart"></canvas>';
        bc?.append(div);
        makePie(col + 'Chart', ['true','false'], [counts[col].true, counts[col].false]);
      });
      // ユーザー分析
      const users = await fetchJSON('/analytics/user-analytics');
      const ageGroups: Record<string, number> = {};
      const genders: Record<string, number> = {};
      users.forEach((u: any) => {
        const ag = u.age !== null ? Math.floor(u.age/10)*10 + 's' : 'unknown';
        ageGroups[ag] = (ageGroups[ag] || 0) + 1;
        const g = u.gender || 'unspecified';
        genders[g] = (genders[g] || 0) + 1;
      });
      makePie('ageChart', Object.keys(ageGroups), Object.values(ageGroups));
      makePie('genderChart', Object.keys(genders), Object.values(genders));
    }
    init().catch(console.error);
  </script>
</body>
</html>`))

export default analytics