import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No tenés una suscripción activa" },
        { status: 400 }
      );
    }

    const portalSession = await createBillingPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "Error al abrir portal" }, { status: 500 });
  }
}
