"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Testimonial {
  id: string;
  text: string;
  authorName: string;
  authorEmail?: string;
  authorCompany?: string;
  authorTitle?: string;
  rating: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadTestimonials();
  }, [filter]);

  async function loadTestimonials() {
    setLoading(true);
    try {
      const res = await fetch(`/api/testimonials?status=${filter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      loadTestimonials();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("¿Seguro que querés eliminar este testimonio? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
      loadTestimonials();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const counts = {
    all: testimonials.length,
    approved: testimonials.filter(t => t.status === "APPROVED").length,
    pending: testimonials.filter(t => t.status === "PENDING").length,
    rejected: testimonials.filter(t => t.status === "REJECTED").length,
  };

  const filteredTestimonials = filter === "all" 
    ? testimonials 
    : testimonials.filter(t => t.status === filter.toUpperCase());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
            Testimonios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestioná y aprobá los testimonios de tus clientes
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todos" },
            { key: "pending", label: "Pendientes" },
            { key: "approved", label: "Aprobados" },
            { key: "rejected", label: "Rechazados" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {label} ({counts[key as keyof typeof counts]})
            </button>
          ))}
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="rounded-2xl bg-muted/50 border border-border p-12 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              No hay testimonios
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Creá un formulario y compartilo con tus clientes para empezar a recibir testimonios.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onApprove={() => updateStatus(testimonial.id, "APPROVED")}
                onReject={() => updateStatus(testimonial.id, "REJECTED")}
                onArchive={() => updateStatus(testimonial.id, "ARCHIVED")}
                onDelete={() => deleteTestimonial(testimonial.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function TestimonialCard({ 
  testimonial, 
  onApprove, 
  onReject,
  onArchive,
  onDelete,
}: { 
  testimonial: Testimonial;
  onApprove: () => void;
  onReject: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-gray-100 text-gray-700",
  };

  const statusLabels = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    ARCHIVED: "Archivado",
  };

  const initials = testimonial.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-2xl bg-card border border-border p-5 hover:border-primary/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-medium">{testimonial.authorName}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[testimonial.status]}`}>
                {statusLabels[testimonial.status]}
              </span>
            </div>
            
            {/* Rating */}
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= testimonial.rating ? "text-amber-500" : "text-muted"}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Text */}
            <p className="leading-relaxed">"{testimonial.text}"</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
              {testimonial.authorCompany && (
                <span>🏢 {testimonial.authorCompany}</span>
              )}
              {testimonial.authorTitle && (
                <span>💼 {testimonial.authorTitle}</span>
              )}
              <span>📅 {new Date(testimonial.createdAt).toLocaleDateString("es-AR")}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 shrink-0">
          {testimonial.status === "PENDING" && (
            <>
              <Button
                size="sm"
                onClick={onApprove}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                ✓ Aprobar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                ✗ Rechazar
              </Button>
            </>
          )}
          {testimonial.status === "APPROVED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={onArchive}
            >
              📦 Archivar
            </Button>
          )}
          {testimonial.status === "REJECTED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={onApprove}
              className="text-accent"
            >
              ✓ Aprobar
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive/10"
          >
            🗑️ Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
