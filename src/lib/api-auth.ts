import { prisma } from "@/lib/db";
import { createHash } from "crypto";

// Hashear API key para almacenarla de forma segura
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Generar una nueva API key
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "tm_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Validar API key y retornar el usuario
export async function validateApiKey(key: string) {
  if (!key || !key.startsWith("tm_")) {
    return null;
  }

  const hashedKey = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
    include: { user: true },
  });

  if (!apiKey || !apiKey.isActive) {
    return null;
  }

  // Verificar expiración
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Verificar que el usuario tiene plan Business
  if (apiKey.user.plan !== "BUSINESS") {
    return null;
  }

  // Actualizar último uso
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  });

  return {
    apiKey,
    user: apiKey.user,
  };
}

// Middleware helper para extraer API key del header
export function getApiKeyFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  
  // También aceptar X-API-Key header
  return request.headers.get("X-API-Key");
}
