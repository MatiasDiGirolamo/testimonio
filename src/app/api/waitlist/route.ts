import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Ya estás en la lista de espera!",
      });
    }

    // Create entry
    await prisma.waitlistEntry.create({
      data: { email },
    });

    return NextResponse.json({
      success: true,
      message: "¡Gracias! Te avisaremos cuando lancemos.",
    });
  } catch (error) {
    console.error("Error en waitlist:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.waitlistEntry.count();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0 });
  }
}
