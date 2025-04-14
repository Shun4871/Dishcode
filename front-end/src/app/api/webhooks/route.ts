// import { verifyWebhook } from '@clerk/nextjs/webhooks'

// export async function POST(req: Request) {
//   try {
//     const evt = await verifyWebhook(req)

//     // Do something with payload
//     // For this guide, log payload to console
//     const { id } = evt.data
//     const eventType = evt.type
//     if (eventType === 'user.created') {
//         console.log('userId:', id)
//       }

//     return new Response('Webhook received', { status: 200 })
//   } catch (err) {
//     console.error('Error verifying webhook:', err)
//     return new Response('Error verifying webhook', { status: 400 })
//   }
// }