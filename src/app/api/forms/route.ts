import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canCreateForm, getPlanLimits } from "@/lib/plans";

// GET - Obtener formularios del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const forms = await prisma.collectionForm.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        _count: { select: { testimonials: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear formulario
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario con su plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Obtener el proyecto del usuario
    const project = await prisma.project.findFirst({
      where: { userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "No tenés un proyecto" }, { status: 400 });
    }

    // Verificar límites del plan
    const currentFormsCount = await prisma.collectionForm.count({
      where: { projectId: project.id },
    });

    if (!canCreateForm(user.plan, currentFormsCount)) {
      const limits = getPlanLimits(user.plan);
      return NextResponse.json(
        { 
          error: `Llegaste al límite de ${limits.forms} formulario(s) en tu plan. Upgrade para crear más.`,
          upgrade: true 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, headline, description, primaryColor } = body;

    // Generar slug único
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const form = await prisma.collectionForm.create({
      data: {
        name,
        slug,
        headline: headline || "¿Cómo fue tu experiencia?",
        description,
        primaryColor: primaryColor || "#C45D3E",
        projectId: project.id,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al crear formulario" }, { status: 500 });
  }
}
