"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/dashboard/testimonials", label: "Testimonios", icon: "💬" },
  { href: "/dashboard/forms", label: "Formularios", icon: "📝" },
  { href: "/dashboard/widgets", label: "Widgets", icon: "🎨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <span className="font-serif font-semibold text-lg hidden sm:block">
                TestimonIO
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings">
              <Button 
                size="sm" 
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                ⚙️
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-muted-foreground hover:text-foreground"
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 p-2 border-b border-border bg-muted/30 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap flex-shrink-0 transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="p-4 sm:p-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
