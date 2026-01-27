"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Error al enviar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="font-serif font-semibold text-xl">Testimonio</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block">
              Precios
            </a>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 sm:pt-40 sm:pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6 text-foreground leading-tight">
                La voz de tus clientes,{" "}
                <span className="text-primary italic">amplificada</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Tus clientes ya te aman. Dejá que el mundo lo sepa. 
                Recolectá testimonios en minutos y mostralos donde más importa.
              </p>

              {/* CTA */}
              {submitted ? (
                <div className="bg-accent/20 border border-accent text-accent-foreground px-6 py-4 rounded-xl mb-8 inline-block">
                  <span className="text-accent">✓</span> ¡Gracias! Te avisamos cuando lancemos.
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 justify-center mb-8 max-w-md mx-auto">
                  <Input 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-card border-border"
                  />
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={loading}
                    className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 whitespace-nowrap"
                  >
                    {loading ? "..." : "Probar gratis"}
                  </Button>
                </form>
              )}
              
              {error && (
                <p className="text-destructive text-sm mb-4">{error}</p>
              )}
              
              <p className="text-sm text-muted-foreground">
                Sin tarjeta de crédito · Setup en 2 minutos
              </p>
            </div>

            {/* Featured testimonial - showing what they'll get */}
            <div className="mt-16 sm:mt-20 max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl shrink-0">
                    👩🏻
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-500">★★★★★</span>
                    </div>
                    <p className="text-lg leading-relaxed mb-4">
                      "Desde que implementamos Testimonio, nuestras conversiones subieron <span className="font-semibold text-primary">un 34%</span>. 
                      Lo mejor es lo fácil que es pedirles reviews a los clientes."
                    </p>
                    <div>
                      <p className="font-medium">María Fernández</p>
                      <p className="text-sm text-muted-foreground">Fundadora de Café Origen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why testimonials matter */}
        <section className="py-16 sm:py-24 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                ¿Por qué importan los testimonios?
              </h2>
              <p className="text-muted-foreground text-lg">
                La gente confía en otras personas, no en publicidades.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
              <StatCard number="93%" text="de los clientes leen reviews antes de comprar" />
              <StatCard number="2.7x" text="más probabilidad de compra con testimonios visibles" />
              <StatCard number="72%" text="confía más en una marca después de leer reviews positivos" />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                Así de simple
              </h2>
              <p className="text-muted-foreground text-lg">
                Tres pasos. Cinco minutos. Listo.
              </p>
            </div>

            <div className="grid gap-8 sm:gap-12 sm:grid-cols-3 max-w-5xl mx-auto">
              <StepCard 
                number="1" 
                icon="📝"
                title="Creá tu formulario" 
                description="Personalizá las preguntas que querés hacer. Elegí colores y estilo."
              />
              <StepCard 
                number="2" 
                icon="📲"
                title="Compartí el link" 
                description="Por email, WhatsApp, o donde quieras. Tus clientes responden en 30 segundos."
              />
              <StepCard 
                number="3" 
                icon="✨"
                title="Mostrá los testimonios" 
                description="Elegí un widget, copiá el código, pegalo en tu web. Magia."
              />
            </div>
          </div>
        </section>

        {/* Features - more subtle */}
        <section className="py-16 sm:py-24 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                Todo lo que necesitás
              </h2>
              <p className="text-muted-foreground text-lg">
                Sin complicaciones. Sin features que nunca vas a usar.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <FeatureCard
                icon="💬"
                title="Formularios personalizables"
                description="Hacé las preguntas que importan. Tu marca, tu estilo."
              />
              <FeatureCard
                icon="📱"
                title="WhatsApp integrado"
                description="Pedí testimonios por WhatsApp. Responden como si fuera un chat."
              />
              <FeatureCard
                icon="🎨"
                title="Widgets hermosos"
                description="Carousel, grid, wall of love. Se ven bien en cualquier web."
              />
              <FeatureCard
                icon="✅"
                title="Moderación simple"
                description="Aprobá o rechazá testimonios con un click. Vos controlás qué se muestra."
              />
              <FeatureCard
                icon="📊"
                title="Analytics claros"
                description="Sabé cuánta gente ve tus testimonios y de dónde vienen."
              />
              <FeatureCard
                icon="🌎"
                title="Hecho para LATAM"
                description="100% en español. Precios en pesos. Soporte real."
              />
            </div>
          </div>
        </section>

        {/* Social proof - other users */}
        <section className="py-16 sm:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                Lo que dicen nuestros usuarios
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <TestimonialCard
                quote="Por fin una herramienta de testimonios que no está pensada solo para gringos."
                name="Lucas Méndez"
                role="eCommerce, Argentina"
                avatar="👨🏻‍💼"
              />
              <TestimonialCard
                quote="Mis clientes me mandan testimonios sin que tenga que perseguirlos. Eso ya vale la suscripción."
                name="Carolina Ruiz"
                role="Consultora, Chile"
                avatar="👩🏽"
              />
              <TestimonialCard
                quote="Instalé el widget en 5 minutos. Literal. Y se ve increíble."
                name="Andrés Vargas"
                role="SaaS Founder, Colombia"
                avatar="👨🏽‍💻"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 sm:py-24 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
                Precios simples
              </h2>
              <p className="text-muted-foreground text-lg">
                Empezá gratis. Escalá cuando lo necesites.
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
              <PricingCard
                name="Gratis"
                price="$0"
                description="Para probar"
                features={[
                  "10 testimonios",
                  "1 formulario",
                  "1 widget",
                  "Badge de Testimonio",
                ]}
              />
              <PricingCard
                name="Pro"
                price="$15"
                period="/mes"
                description="Para negocios"
                features={[
                  "100 testimonios",
                  "Formularios ilimitados",
                  "Widgets ilimitados",
                  "Sin badge",
                  "Import Google Reviews",
                ]}
                highlighted
              />
              <PricingCard
                name="Business"
                price="$29"
                period="/mes"
                description="Para equipos"
                features={[
                  "Testimonios ilimitados",
                  "Todo de Pro",
                  "WhatsApp bot",
                  "Analytics avanzados",
                  "Soporte prioritario",
                ]}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-primary/5 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-4">
              ¿Listo para que tus clientes hablen por vos?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
              Creá tu cuenta gratis. No necesitás tarjeta.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-10 text-lg">
                Empezar ahora →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span className="font-serif font-medium">Testimonio</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition">Términos</a>
              <a href="#" className="hover:text-foreground transition">Privacidad</a>
              <a href="mailto:hola@testimonio.app" className="hover:text-foreground transition">Contacto</a>
            </div>
            <p className="text-sm text-muted-foreground">
              Hecho con cariño para LATAM 🧉
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ number, text }: { number: string; text: string }) {
  return (
    <div className="text-center p-6">
      <p className="font-serif text-4xl sm:text-5xl font-semibold text-primary mb-2">{number}</p>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border text-3xl mb-4 shadow-sm">
        {icon}
      </div>
      <div className="text-sm text-muted-foreground mb-2">Paso {number}</div>
      <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role, avatar }: { quote: string; name: string; role: string; avatar: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <p className="mb-4 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
          {avatar}
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period,
  description, 
  features, 
  highlighted = false 
}: { 
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div className={`relative p-6 sm:p-8 rounded-2xl border transition-all ${
      highlighted 
        ? "bg-card border-primary shadow-lg scale-[1.02]" 
        : "bg-card border-border hover:border-primary/30"
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
            Más popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mb-6">
        <span className="font-serif text-4xl font-semibold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="text-accent">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/register" className="block">
        <Button 
          className={`w-full ${
            highlighted 
              ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
              : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          }`}
        >
          {price === "$0" ? "Empezar gratis" : "Elegir plan"}
        </Button>
      </Link>
    </div>
  );
}
