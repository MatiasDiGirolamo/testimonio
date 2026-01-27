"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Form {
  id: string;
  name: string;
  slug: string;
  headline: string;
  submissions: number;
  views: number;
  createdAt: string;
  _count?: { testimonials: number };
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      if (Array.isArray(data)) {
        setForms(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createForm() {
    if (!formName.trim()) return;
    setCreating(true);
    
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName }),
      });
      
      if (res.ok) {
        setFormName("");
        setShowCreate(false);
        loadForms();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCreating(false);
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/t/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
              Formularios
            </h1>
            <p className="text-muted-foreground mt-1">
              Creá formularios para recolectar testimonios
            </p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Nuevo formulario
          </Button>
        </div>

        {/* Create Form Modal/Card */}
        {showCreate && (
          <div className="rounded-2xl bg-card border border-border p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">Crear formulario</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Nombre del formulario"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-background border-border"
              />
              <Button 
                onClick={createForm} 
                disabled={creating || !formName.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {creating ? "Creando..." : "Crear"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Forms List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : forms.length === 0 ? (
          <div className="rounded-2xl bg-muted/50 border border-border p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Creá tu primer formulario
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Los formularios te permiten recolectar testimonios de tus clientes de forma fácil.
            </p>
            <Button 
              onClick={() => setShowCreate(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Crear formulario
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="group rounded-2xl bg-card border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">/t/{form.slug}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                    Activo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="font-serif text-2xl font-semibold">{form._count?.testimonials || 0}</p>
                    <p className="text-xs text-muted-foreground">Respuestas</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3 text-center">
                    <p className="font-serif text-2xl font-semibold">{form.views}</p>
                    <p className="text-xs text-muted-foreground">Vistas</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/t/${form.slug}`, "_blank")}
                  >
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => copyLink(form.slug)}
                  >
                    Copiar link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
