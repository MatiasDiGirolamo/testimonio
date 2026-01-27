import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canCreateTestimonial, getPlanLimits } from "@/lib/plans";

// POST - Enviar testimonio público (desde el formulario de recolección)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { text, authorName, authorEmail, authorCompany, authorTitle, rating } = body;

    if (!text || !authorName) {
      return NextResponse.json(
        { error: "Texto y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el formulario con el proyecto y usuario
    const form = await prisma.collectionForm.findUnique({
      where: { slug },
      include: { 
        project: {
          include: { user: true }
        } 
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });
    }

    // Verificar límites del plan del dueño del formulario
    const currentTestimonialsCount = await prisma.testimonial.count({
      where: { projectId: form.projectId },
    });

    const userPlan = form.project.user.plan;
    
    if (!canCreateTestimonial(userPlan, currentTestimonialsCount)) {
      const limits = getPlanLimits(userPlan);
      return NextResponse.json(
        { error: `Este formulario ha alcanzado su límite de testimonios (${limits.testimonials}). Contactá al dueño.` },
        { status: 403 }
      );
    }

    // Incrementar contador de submissions
    await prisma.collectionForm.update({
      where: { id: form.id },
      data: { submissions: { increment: 1 } },
    });

    // Crear el testimonio
    const testimonial = await prisma.testimonial.create({
      data: {
        text,
        authorName,
        authorEmail,
        authorCompany,
        authorTitle,
        rating: rating || 5,
        status: "PENDING",
        source: "form",
        projectId: form.projectId,
        formId: form.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: form.thankYouMsg || "¡Gracias por tu testimonio!",
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
