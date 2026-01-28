"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface UserPlan {
  plan: "FREE" | "PRO" | "BUSINESS";
  stripeCurrentPeriodEnd?: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [userPlan, setUserPlan] = useState<UserPlan>({ plan: "FREE" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check for success/cancel from Stripe
    if (searchParams.get("success")) {
      setMessage("🎉 ¡Pago exitoso! Tu plan se actualizará en unos segundos.");
      setTimeout(() => setMessage(""), 5000);
    }
    if (searchParams.get("canceled")) {
      setMessage("Pago cancelado. Podés intentar de nuevo cuando quieras.");
      setTimeout(() => setMessage(""), 5000);
    }
    
    // Load user plan
    loadUserPlan();
  }, [searchParams]);

  async function loadUserPlan() {
    try {
      const res = await fetch("/api/user/plan");
      if (res.ok) {
        const data = await res.json();
        setUserPlan(data);
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    }
  }

  async function handleUpgrade(plan: "PRO" | "BUSINESS") {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: "monthly" }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "Error al procesar");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "Error al abrir portal");
      }
    } catch (error) {
      setMessage("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  const planFeatures = {
    FREE: ["10 testimonios", "1 formulario", "1 widget", "Branding de TestimonIO"],
    PRO: ["100 testimonios", "Formularios ilimitados", "Widgets ilimitados", "Sin branding", "Import Google Reviews"],
    BUSINESS: ["TestimonIOs ilimitados", "Todo de Pro", "WhatsApp bot", "Analytics avanzados", "API access"],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestioná tu cuenta y suscripción</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.includes("🎉") ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
          }`}>
            {message}
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-semibold text-lg">Tu plan actual</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              userPlan.plan === "FREE" 
                ? "bg-muted text-muted-foreground"
                : userPlan.plan === "PRO"
                ? "bg-primary/20 text-primary"
                : "bg-accent/20 text-accent"
            }`}>
              {userPlan.plan}
            </span>
          </div>
          
          <ul className="space-y-2 text-sm mb-4">
            {planFeatures[userPlan.plan].map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                {feature}
              </li>
            ))}
          </ul>

          {userPlan.stripeCurrentPeriodEnd && (
            <p className="text-sm text-muted-foreground mb-4">
              Próxima facturación: {new Date(userPlan.stripeCurrentPeriodEnd).toLocaleDateString("es-AR")}
            </p>
          )}

          {userPlan.plan !== "FREE" && (
            <Button 
              variant="outline" 
              onClick={handleManageBilling}
              disabled={loading}
            >
              Gestionar suscripción
            </Button>
          )}
        </div>

        {/* Upgrade Options */}
        {userPlan.plan === "FREE" && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-serif font-semibold text-lg mb-4">Upgrade tu plan</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Pro */}
              <div className="border border-primary/30 rounded-xl p-4 bg-primary/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Pro</h3>
                    <p className="text-sm text-muted-foreground">Para negocios</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-semibold">$10</p>
                    <p className="text-xs text-muted-foreground">/mes</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                  <li>✓ 100 testimonios</li>
                  <li>✓ Sin branding</li>
                  <li>✓ Import Google Reviews</li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleUpgrade("PRO")}
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Elegir Pro"}
                </Button>
              </div>

              {/* Business */}
              <div className="border border-accent/30 rounded-xl p-4 bg-accent/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Business</h3>
                    <p className="text-sm text-muted-foreground">Para equipos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-semibold">$20</p>
                    <p className="text-xs text-muted-foreground">/mes</p>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                  <li>✓ TestimonIOs ilimitados</li>
                  <li>✓ WhatsApp bot</li>
                  <li>✓ API access</li>
                </ul>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleUpgrade("BUSINESS")}
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Elegir Business"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Project settings */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif font-semibold text-lg mb-4">Proyecto</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre del proyecto
              </label>
              <Input defaultValue="Mi Empresa" className="bg-background border-border" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sitio web
              </label>
              <Input placeholder="https://miempresa.com" className="bg-background border-border" />
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Guardar cambios
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card border border-destructive/30 rounded-2xl p-6">
          <h2 className="font-serif font-semibold text-lg text-destructive mb-4">Zona de peligro</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Exportar datos</p>
                <p className="text-sm text-muted-foreground">Descargá todos tus testimonios</p>
              </div>
              <Button variant="outline">Exportar</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Eliminar cuenta</p>
                <p className="text-sm text-muted-foreground">Esto no se puede deshacer</p>
              </div>
              <Button variant="destructive">Eliminar</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="p-6">Cargando...</div></DashboardLayout>}>
      <SettingsContent />
    </Suspense>
  );
}
