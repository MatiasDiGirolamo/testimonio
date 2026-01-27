import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Obtener testimonios del usuario
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const where: any = { projectId: { in: projectIds } };
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear testimonio manualmente
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { text, authorName, authorEmail, authorCompany, authorTitle, rating } = body;

    const project = await prisma.project.findFirst({
      where: { userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "No tenés un proyecto" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        text,
        authorName,
        authorEmail,
        authorCompany,
        authorTitle,
        rating: rating || 5,
        status: "APPROVED",
        source: "manual",
        projectId: project.id,
      },
    });

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al crear testimonio" }, { status: 500 });
  }
}
