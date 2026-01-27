import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { PLAN_PRICES } from "@/lib/plans";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  const stripeClient = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((session as any).mode === "subscription" && (session as any).subscription) {
          const subscription = await stripeClient.subscriptions.retrieve(
            (session as any).subscription as string
          );
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = subscription as any;
          const userId = (session as any).metadata?.userId || sub.metadata?.userId;
          
          if (userId) {
            const plan = getPlanFromPriceId(sub.items.data[0].price.id);
            
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeSubscriptionId: sub.id,
                stripePriceId: sub.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
                plan: plan,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        
        if (invoice.subscription) {
          const subscription = await stripeClient.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sub = subscription as any;
          const userId = sub.metadata?.userId;
          
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              plan: plan,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripePriceId: null,
              stripeSubscriptionId: null,
              stripeCurrentPeriodEnd: null,
              plan: "FREE",
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function getPlanFromPriceId(priceId: string): "FREE" | "PRO" | "BUSINESS" {
  if (
    priceId === PLAN_PRICES.PRO.stripePriceIdMonthly ||
    priceId === PLAN_PRICES.PRO.stripePriceIdYearly
  ) {
    return "PRO";
  }
  
  if (
    priceId === PLAN_PRICES.BUSINESS.stripePriceIdMonthly ||
    priceId === PLAN_PRICES.BUSINESS.stripePriceIdYearly
  ) {
    return "BUSINESS";
  }
  
  return "FREE";
}
