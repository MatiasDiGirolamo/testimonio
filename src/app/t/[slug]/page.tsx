"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TestimonialFormPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      text: formData.get("text"),
      authorName: formData.get("name"),
      authorEmail: formData.get("email"),
      authorCompany: formData.get("company"),
      authorTitle: formData.get("title"),
      rating,
    };

    try {
      const res = await fetch(`/api/submit/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const result = await res.json();
        setError(result.error || "Error al enviar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center text-4xl">
            🎉
          </div>
          <h1 className="font-serif text-3xl font-semibold mb-3">¡Gracias!</h1>
          <p className="text-muted-foreground text-lg">
            Tu testimonio fue enviado correctamente.
            Lo revisaremos pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            💬
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold mb-2">
            ¿Cómo fue tu experiencia?
          </h1>
          <p className="text-muted-foreground">
            Tu opinión nos ayuda a mejorar y ayuda a otros a decidir.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-sm font-medium mb-3">
                Tu calificación
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all hover:scale-110 ${
                      star <= rating ? "text-amber-500" : "text-muted"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tu testimonio *
              </label>
              <Textarea
                name="text"
                placeholder="Contanos tu experiencia..."
                rows={4}
                required
                className="bg-background border-border resize-none rounded-xl"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tu nombre *
              </label>
              <Input
                name="name"
                placeholder="Juan Pérez"
                required
                className="bg-background border-border rounded-xl h-12"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tu email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="juan@email.com"
                className="bg-background border-border rounded-xl h-12"
              />
              <p className="text-xs text-muted-foreground mt-1">
                No será mostrado públicamente
              </p>
            </div>

            {/* Company & Title */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Empresa
                </label>
                <Input
                  name="company"
                  placeholder="Empresa SA"
                  className="bg-background border-border rounded-xl h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cargo
                </label>
                <Input
                  name="title"
                  placeholder="CEO"
                  className="bg-background border-border rounded-xl h-12"
                />
              </div>
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              size="lg"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
            >
              {loading ? "Enviando..." : "Enviar testimonio →"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Al enviar, aceptás que tu testimonio puede ser mostrado públicamente.
            </p>
          </form>
        </div>

        {/* Powered by */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Powered by <span className="font-semibold">Testimonio</span>
          </a>
        </div>
      </div>
    </div>
  );
}
