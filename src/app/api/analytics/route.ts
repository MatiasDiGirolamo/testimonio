import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener proyectos del usuario
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    // Estadísticas básicas
    const [
      totalTestimonials,
      approvedTestimonials,
      pendingTestimonials,
      totalForms,
      totalWidgets,
    ] = await Promise.all([
      prisma.testimonial.count({
        where: { projectId: { in: projectIds } },
      }),
      prisma.testimonial.count({
        where: { projectId: { in: projectIds }, status: "APPROVED" },
      }),
      prisma.testimonial.count({
        where: { projectId: { in: projectIds }, status: "PENDING" },
      }),
      prisma.collectionForm.count({
        where: { projectId: { in: projectIds } },
      }),
      prisma.widget.count({
        where: { projectId: { in: projectIds } },
      }),
    ]);

    // Sumar vistas de widgets y submissions de forms
    const widgetViews = await prisma.widget.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { views: true },
    });

    const formSubmissions = await prisma.collectionForm.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { submissions: true },
    });

    // Últimos testimonios
    const recentTestimonials = await prisma.testimonial.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        authorName: true,
        createdAt: true,
        status: true,
      },
    });

    // Testimonios por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const testimonialsByDay = await prisma.testimonial.groupBy({
      by: ["createdAt"],
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    // Agrupar por día
    const dayMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dayMap.set(key, 0);
    }

    testimonialsByDay.forEach((t) => {
      const key = new Date(t.createdAt).toISOString().split("T")[0];
      dayMap.set(key, (dayMap.get(key) || 0) + t._count);
    });

    const testimonialsByDayArray = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calcular tasa de aprobación
    const approvalRate =
      totalTestimonials > 0
        ? Math.round((approvedTestimonials / totalTestimonials) * 100)
        : 0;

    return NextResponse.json({
      totalTestimonials,
      approvedTestimonials,
      pendingTestimonials,
      totalForms,
      totalWidgets,
      totalWidgetViews: widgetViews._sum.views || 0,
      totalFormSubmissions: formSubmissions._sum.submissions || 0,
      approvalRate,
      recentTestimonials,
      testimonialsByDay: testimonialsByDayArray,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
