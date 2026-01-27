import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canCreateWidget, getPlanLimits, shouldShowBranding } from "@/lib/plans";

// GET - Obtener widgets del usuario
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

    const widgets = await prisma.widget.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        _count: { select: { testimonials: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(widgets);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST - Crear widget
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener usuario con plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const project = await prisma.project.findFirst({
      where: { userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "No tenés un proyecto" }, { status: 400 });
    }

    // Verificar límites
    const currentWidgetsCount = await prisma.widget.count({
      where: { projectId: project.id },
    });

    if (!canCreateWidget(user.plan, currentWidgetsCount)) {
      const limits = getPlanLimits(user.plan);
      return NextResponse.json(
        { 
          error: `Llegaste al límite de ${limits.widgets} widget(s) en tu plan. Upgrade para crear más.`,
          upgrade: true 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, type, primaryColor, bgColor, textColor, theme } = body;

    // Determinar si debe mostrar branding según el plan
    const showBranding = shouldShowBranding(user.plan);

    const widget = await prisma.widget.create({
      data: {
        name,
        type: type || "CAROUSEL",
        primaryColor: primaryColor || "#C45D3E",
        bgColor: bgColor || "#FAF7F2",
        textColor: textColor || "#2D2A26",
        theme: theme || "light",
        showBranding,
        projectId: project.id,
      },
    });

    return NextResponse.json(widget);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al crear widget" }, { status: 500 });
  }
}
