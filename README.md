# TestimonIO 💬

**La herramienta de testimonios más simple para LATAM.**

Recolectá testimonios de tus clientes en minutos, moderalos desde un dashboard intuitivo, y mostralos en tu web con widgets personalizables.

🌐 **Live:** [testimon-io.vercel.app](https://testimon-io.vercel.app)

![TestimonIO Preview](https://testimon-io.vercel.app/og-image.png)

---

## ✨ Features

- **📝 Formularios de recolección** - Creá formularios personalizados y compartilos por link o WhatsApp
- **✅ Moderación simple** - Aprobá o rechazá testimonios con un click
- **🎨 Widgets embebibles** - Carousel, Grid, Wall of Love - se adaptan a cualquier web
- **📊 Dashboard intuitivo** - Visualizá estadísticas y gestioná todo desde un solo lugar
- **🌎 Hecho para LATAM** - 100% en español, precios accesibles

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Payments:** Lemon Squeezy
- **Deploy:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (recomendamos [Neon](https://neon.tech) - free tier)

### Installation

```bash
# Clonar el repo
git clone https://github.com/MatiasDiGirolamo/testimonio.git
cd testimonio

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Generar cliente Prisma
npx prisma generate

# Correr migraciones
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Lemon Squeezy (pagos)
LEMONSQUEEZY_API_KEY=""
LEMONSQUEEZY_WEBHOOK_SECRET=""
```

---

## 💰 Pricing

| Plan | Precio | Incluye |
|------|--------|---------|
| **Free** | $0/mes | 10 testimonios, 1 form, 1 widget |
| **Pro** | $15/mes | 100 testimonios, ilimitados forms y widgets, sin branding |
| **Business** | $29/mes | Ilimitado, WhatsApp, API access |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register
│   ├── api/             # API Routes
│   ├── dashboard/       # Dashboard pages
│   ├── t/[slug]/        # Public testimonial form
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn components
│   └── layout/          # Layout components
└── lib/
    ├── auth.ts          # NextAuth config
    ├── db.ts            # Prisma client
    ├── plans.ts         # Plan limits
    └── stripe.ts        # Payment helpers
```

---

## 🤝 Contributing

Las contribuciones son bienvenidas! Por favor abrí un issue primero para discutir los cambios que querés hacer.

---

## 📄 License

MIT © [Mati Di Girolamo](https://github.com/MatiasDiGirolamo)

---

<p align="center">
  Hecho con ❤️ para LATAM 🧉
</p>
