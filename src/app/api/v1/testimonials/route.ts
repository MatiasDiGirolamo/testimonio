import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateApiKey, getApiKeyFromRequest } from "@/lib/api-auth";

// GET /api/v1/testimonials - Listar testimonios
export async function GET(request: Request) {
  try {
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Use Authorization: Bearer <key>" },
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "APPROVED";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Obtener proyectos del usuario
    const projects = await prisma.project.findMany({
      where: { userId: auth.user.id },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const testimonials = await prisma.testimonial.findMany({
      where: {
        projectId: { in: projectIds },
        ...(status !== "all" && { status: status as any }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        text: true,
        rating: true,
        authorName: true,
        authorEmail: true,
        authorCompany: true,
        authorTitle: true,
        status: true,
        source: true,
        createdAt: true,
      },
    });

    const total = await prisma.testimonial.count({
      where: {
        projectId: { in: projectIds },
        ...(status !== "all" && { status: status as any }),
      },
    });

    return NextResponse.json({
      data: testimonials,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/v1/testimonials - Crear testimonio
export async function POST(request: Request) {
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

    // Verificar permisos de escritura
    if (!auth.apiKey.permissions.includes("write")) {
      return NextResponse.json(
        { error: "API key does not have write permission" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text, authorName, authorEmail, authorCompany, authorTitle, rating, status } = body;

    if (!text || !authorName) {
      return NextResponse.json(
        { error: "text and authorName are required" },
        { status: 400 }
      );
    }

    // Obtener primer proyecto del usuario
    const project = await prisma.project.findFirst({
      where: { userId: auth.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "No project found" },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        text,
        authorName,
        authorEmail,
        authorCompany,
        authorTitle,
        rating: rating || 5,
        status: status || "PENDING",
        source: "api",
        projectId: project.id,
      },
    });

    return NextResponse.json({ data: testimonial }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
