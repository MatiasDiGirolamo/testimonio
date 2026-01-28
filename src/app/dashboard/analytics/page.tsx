"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface AnalyticsData {
  totalTestimonials: number;
  approvedTestimonials: number;
  pendingTestimonials: number;
  totalForms: number;
  totalWidgets: number;
  totalWidgetViews: number;
  totalFormSubmissions: number;
  approvalRate: number;
  recentTestimonials: Array<{
    id: string;
    authorName: string;
    createdAt: string;
    status: string;
  }>;
  testimonialsByDay: Array<{
    date: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<string>("FREE");

  useEffect(() => {
    loadAnalytics();
    loadUserPlan();
  }, []);

  async function loadUserPlan() {
    try {
      const res = await fetch("/api/user/plan");
      if (res.ok) {
        const data = await res.json();
        setUserPlan(data.plan);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      </DashboardLayout>
    );
  }

  const isBusinessPlan = userPlan === "BUSINESS";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Métricas y estadísticas de tus testimonios
          </p>
        </div>

        {!isBusinessPlan && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="text-sm">
              📊 Estás viendo analytics básicos. <strong>Upgrade a Business</strong> para ver analytics avanzados con gráficos detallados.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total testimonios"
            value={data?.totalTestimonials || 0}
            icon="💬"
          />
          <StatCard
            label="Aprobados"
            value={data?.approvedTestimonials || 0}
            icon="✅"
            subtext={`${data?.approvalRate || 0}% tasa de aprobación`}
          />
          <StatCard
            label="Pendientes"
            value={data?.pendingTestimonials || 0}
            icon="⏳"
          />
          <StatCard
            label="Vistas de widgets"
            value={data?.totalWidgetViews || 0}
            icon="👁️"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Formularios activos"
            value={data?.totalForms || 0}
            icon="📝"
          />
          <StatCard
            label="Widgets creados"
            value={data?.totalWidgets || 0}
            icon="🎨"
          />
          <StatCard
            label="Submissions totales"
            value={data?.totalFormSubmissions || 0}
            icon="📥"
          />
        </div>

        {/* Chart placeholder - Business only */}
        {isBusinessPlan && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">
              Testimonios por día (últimos 30 días)
            </h3>
            <div className="h-64 flex items-end gap-1">
              {(data?.testimonialsByDay || []).map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t"
                    style={{
                      height: `${Math.max(day.count * 20, 4)}px`,
                      maxHeight: "200px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground rotate-45 origin-left">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              ))}
              {(!data?.testimonialsByDay || data.testimonialsByDay.length === 0) && (
                <div className="flex-1 text-center text-muted-foreground">
                  No hay datos suficientes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Testimonials */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">
            Últimos testimonios
          </h3>
          {data?.recentTestimonials && data.recentTestimonials.length > 0 ? (
            <div className="space-y-3">
              {data.recentTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{t.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : t.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.status === "APPROVED"
                      ? "Aprobado"
                      : t.status === "PENDING"
                      ? "Pendiente"
                      : "Rechazado"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay testimonios aún</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtext,
}: {
  label: string;
  value: number;
  icon: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="font-serif text-3xl font-semibold">{value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}
