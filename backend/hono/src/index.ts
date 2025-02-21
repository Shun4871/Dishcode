
import { Hono } from 'hono'

import { Prisma, PrismaClient } from "@prisma/client";
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { WebhookEvent } from '@clerk/backend'
import { Webhook } from 'svix'

import { z } from 'zod'
import { zValidate } from '@hono/zod-validate'

const app = new Hono()

const prisma = new PrismaClient();

.post("/webhook/clerk",async(c)=>{
    const SIGNING_SECRET = process.env.

    if(!SIGNING_SECRET){
        return c.status(500).send("Internal Server Error")
    }

)



export default{
    port: 8000,
    fetch: app.fetch
} 