// src/routes/webhooks.ts
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.post('/clerk', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()

  if (body.type === 'user.created') {
    const clerkId = body.data.id
    const email = body.data.email_addresses?.[0]?.email_address

    // すでに登録されていたらスキップ（idempotentな設計）
    await db.insert(user).values({
      clerkId,
      email,
    }).onConflictDoNothing()

    return c.json({ status: 'user created' })
  }
  if (body.type === 'user.deleted') {
    const clerkId = body.data.id

    await db.delete(user).where(eq(user.clerkId, clerkId)).execute()

    return c.json({ status: 'user deleted' })
  }

  return c.json({ status: 'ignored' })
})

export default app
