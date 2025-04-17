// src/routes/webhooks.ts
import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { user } from '../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.post('/clerk', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { type, data } = body;

  const clerkId = data.id as string;
  const email = data.email_addresses?.[0]?.email_address ?? null;
  const birthday = data.birthday ?? null;  // YYYY-MM-DD 文字列
  const gender = data.gender ?? null;      // Clerk 上の文字列

  if (type === 'user.created') {
    await db
      .insert(user)
      .values({ clerkId, email, birthday, gender })
      .onConflictDoNothing();
    return c.json({ status: 'user created' });
  }

  if (type === 'user.updated') {
    await db
      .update(user)
      .set({ email, birthday, gender })
      .where(eq(user.clerkId, clerkId))
      .execute();
    return c.json({ status: 'user updated' });
  }

  if (type === 'user.deleted') {
    await db
      .delete(user)
      .where(eq(user.clerkId, clerkId))
      .execute();
    return c.json({ status: 'user deleted' });
  }

  return c.json({ status: 'ignored' });
});

export default app
