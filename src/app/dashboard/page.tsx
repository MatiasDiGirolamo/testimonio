"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  forms: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, forms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [testimonialsRes, formsRes] = await Promise.all([
          fetch("/api/testimonials"),
          fetch("/api/forms"),
        ]);
        
        const testimonials = await testimonialsRes.json();
        const forms = await formsRes.json();
        
        if (Array.isArray(testimonials)) {
          setStats({
            total: testimonials.length,
            approved: testimonials.filter((t: { status: string }) => t.status === "APPROVED").length,
            pending: testimonials.filter((t: { status: string }) => t.status === "PENDING").length,
            forms: Array.isArray(forms) ? forms.length : 0,
          });
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
              Bienvenido 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Resumen de tu cuenta
            </p>
          </div>
          <Link href="/dashboard/forms">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              + Nuevo formulario
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total testimonios"
            value={loading ? "-" : stats.total.toString()}
            icon="💬"
          />
          <StatCard
            label="Aprobados"
            value={loading ? "-" : stats.approved.toString()}
            icon="✅"
          />
          <StatCard
            label="Pendientes"
            value={loading ? "-" : stats.pending.toString()}
            icon="⏳"
          />
          <StatCard
            label="Formularios"
            value={loading ? "-" : stats.forms.toString()}
            icon="📝"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-serif text-lg font-semibold mb-2">Recolectar testimonios</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Creá un formulario y compartilo con tus clientes para empezar a recibir testimonios.
            </p>
            <Link href="/dashboard/forms">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Crear formulario →
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-serif text-lg font-semibold mb-2">Mostrar en tu web</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Creá un widget y pegá el código en tu sitio para mostrar tus mejores testimonios.
            </p>
            <Link href="/dashboard/widgets">
              <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                Crear widget →
              </Button>
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-muted/50 border border-border p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-medium mb-1">Tip del día</h4>
              <p className="text-sm text-muted-foreground">
                El mejor momento para pedir un testimonio es justo después de que tu cliente tuvo una experiencia positiva. 
                Enviales el link del formulario por WhatsApp para máxima conversión.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon }: { 
  label: string; 
  value: string; 
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="font-serif text-3xl sm:text-4xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
