import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutSession, getOrCreateCustomer } from "@/lib/stripe";
import { PLAN_PRICES } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { plan, billing = "monthly" } = await request.json();

    if (!plan || !["PRO", "BUSINESS"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await getOrCreateCustomer({
        email: user.email,
        name: user.name || undefined,
        userId: user.id,
      });
      
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get price ID
    const planPrices = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    const priceId = billing === "yearly" 
      ? planPrices.stripePriceIdYearly 
      : planPrices.stripePriceIdMonthly;

    if (!priceId) {
      return NextResponse.json({ error: "Precio no configurado" }, { status: 500 });
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      priceId,
      userId: user.id,
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Error al crear checkout" }, { status: 500 });
  }
}
