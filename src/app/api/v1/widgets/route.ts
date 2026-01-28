import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, getApiKeyFromRequest } from "@/lib/api-auth";

// GET /api/v1/widgets - Listar widgets
export async function GET(request: Request) {
  try {
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    const auth = await validateApiKey(apiKey);
    if (!auth) {
      return NextResponse.json(
        { error: "Invalid or expired API key" },
        { status: 401 }
      );
    }

    // Obtener proyectos del usuario
    const projects = await prisma.project.findMany({
      where: { userId: auth.user.id },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const widgets = await prisma.widget.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        theme: true,
        primaryColor: true,
        views: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: widgets });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
