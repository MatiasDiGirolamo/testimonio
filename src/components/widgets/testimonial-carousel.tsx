"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Testimonial {
  id: string;
  text: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorPhoto?: string;
  rating?: number;
}

interface CarouselWidgetProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  showRating?: boolean;
  showCompany?: boolean;
  primaryColor?: string;
}

export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  showRating = true,
  showCompany = true,
  primaryColor = "#3b82f6",
}: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="p-6 relative overflow-hidden">
        {/* Quote icon */}
        <div 
          className="absolute top-4 left-4 text-4xl opacity-20"
          style={{ color: primaryColor }}
        >
          "
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Rating */}
          {showRating && current.rating && (
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < current.rating! ? "text-yellow-400" : "text-slate-200"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Text */}
          <p className="text-lg text-slate-700 mb-4 italic">
            "{current.text}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            {current.authorPhoto ? (
              <img
                src={current.authorPhoto}
                alt={current.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {current.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{current.authorName}</p>
              {showCompany && (current.authorTitle || current.authorCompany) && (
                <p className="text-sm text-slate-500">
                  {[current.authorTitle, current.authorCompany]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-slate-800" : "bg-slate-300"
                }`}
                style={i === currentIndex ? { backgroundColor: primaryColor } : {}}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Powered by */}
      <div className="text-center mt-2">
        <a
          href="https://testimonio.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Powered by Testimonio
        </a>
      </div>
    </div>
  );
}

// Ejemplo de uso:
// <TestimonialCarousel
//   testimonials={[
//     { id: "1", text: "Excelente!", authorName: "Juan", rating: 5 },
//     { id: "2", text: "Muy bueno", authorName: "Maria", rating: 4 },
//   ]}
// />
