"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface Widget {
  id: string;
  name: string;
  type: string;
  theme: string;
  primaryColor: string;
  views: number;
  createdAt: string;
  _count?: { testimonials: number };
}

const widgetTypes = [
  { key: "CAROUSEL", label: "Carousel", icon: "🎠", desc: "Slider horizontal" },
  { key: "GRID", label: "Grid", icon: "📱", desc: "Grilla de cards" },
  { key: "WALL", label: "Wall of Love", icon: "💕", desc: "Muro masonry" },
  { key: "SINGLE", label: "Single", icon: "1️⃣", desc: "Un testimonio" },
];

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [widgetName, setWidgetName] = useState("");
  const [widgetType, setWidgetType] = useState("CAROUSEL");

  useEffect(() => {
    loadWidgets();
  }, []);

  async function loadWidgets() {
    try {
      const res = await fetch("/api/widgets");
      const data = await res.json();
      if (Array.isArray(data)) {
        setWidgets(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createWidget() {
    if (!widgetName.trim()) return;
    setCreating(true);
    
    try {
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: widgetName, type: widgetType }),
      });
      
      if (res.ok) {
        setWidgetName("");
        setWidgetType("CAROUSEL");
        setShowCreate(false);
        loadWidgets();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCreating(false);
    }
  }

  const copyCode = (id: string) => {
    const code = `<div data-testimonio-widget="${id}"></div>
<script src="${window.location.origin}/api/embed/${id}" async></script>`;
    navigator.clipboard.writeText(code);
    alert("Código copiado! Pegalo en tu sitio web.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
              Widgets
            </h1>
            <p className="text-muted-foreground mt-1">
              Creá widgets para mostrar testimonios en tu web
            </p>
          </div>
          <Button 
            onClick={() => setShowCreate(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            + Nuevo widget
          </Button>
        </div>

        {/* Create Widget */}
        {showCreate && (
          <div className="rounded-2xl bg-card border border-border p-6">
            <h3 className="font-serif text-lg font-semibold mb-4">Crear widget</h3>
            
            <div className="space-y-4">
              <Input
                placeholder="Nombre del widget"
                value={widgetName}
                onChange={(e) => setWidgetName(e.target.value)}
                className="bg-background border-border"
              />
              
              {/* Type Selection */}
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Tipo de widget</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {widgetTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setWidgetType(type.key)}
                      className={`p-4 rounded-xl text-center transition-all border ${
                        widgetType === type.key
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/50 border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium text-sm">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={createWidget} 
                  disabled={creating || !widgetName.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {creating ? "Creando..." : "Crear widget"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreate(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Widgets List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : widgets.length === 0 ? (
          <div className="rounded-2xl bg-muted/50 border border-border p-12 text-center">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Creá tu primer widget
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Elegí un estilo y personalizá cómo se ven tus testimonios en tu web.
            </p>
            <Button 
              onClick={() => setShowCreate(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Crear widget
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => {
              const type = widgetTypes.find(t => t.key === widget.type) || widgetTypes[0];
              return (
                <div
                  key={widget.id}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
                >
                  {/* Preview */}
                  <div className="h-32 bg-muted/50 flex items-center justify-center">
                    <span className="text-5xl">{type.icon}</span>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {widget.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{type.label}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-semibold">{widget.views}</span> vistas
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const baseUrl = window.location.origin;
                          const previewUrl = `${baseUrl}/api/embed/${widget.id}/preview`;
                          window.open(previewUrl, '_blank');
                        }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => copyCode(widget.id)}
                      >
                        Copiar código
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
