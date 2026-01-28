import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateApiKey, hashApiKey } from "@/lib/api-auth";

// GET /api/keys - Listar API keys del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar plan Business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.plan !== "BUSINESS") {
      return NextResponse.json(
        { error: "API access requiere plan Business" },
        { status: 403 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        permissions: true,
        lastUsedAt: true,
        usageCount: true,
        isActive: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// POST /api/keys - Crear nueva API key
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar plan Business
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.plan !== "BUSINESS") {
      return NextResponse.json(
        { error: "API access requiere plan Business" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, permissions = ["read"] } = body;

    if (!name) {
      return NextResponse.json(
        { error: "name es requerido" },
        { status: 400 }
      );
    }

    // Generar key
    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);
    const keyPreview = rawKey.slice(-4);

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key: hashedKey,
        keyPreview,
        permissions,
        userId: session.user.id,
      },
    });

    // Retornar la key RAW solo esta vez (no se puede recuperar después)
    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // ⚠️ Solo se muestra una vez
      keyPreview: apiKey.keyPreview,
      permissions: apiKey.permissions,
      message: "Guardá esta key, no se puede recuperar después",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// DELETE /api/keys - Eliminar API key
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "id es requerido" }, { status: 400 });
    }

    // Verificar que la key pertenece al usuario
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey || apiKey.userId !== session.user.id) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id: keyId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
