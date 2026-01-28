import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params;

  try {
    // Buscar el widget
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: { project: true },
    });

    if (!widget) {
      return new NextResponse("// Widget not found", {
        headers: { "Content-Type": "application/javascript" },
      });
    }

    // Incrementar vistas
    await prisma.widget.update({
      where: { id: widgetId },
      data: { views: { increment: 1 } },
    });

    // Obtener todos los proyectos del usuario dueño del widget
    const userProjects = await prisma.project.findMany({
      where: { userId: widget.project.userId },
      select: { id: true },
    });
    
    const projectIds = userProjects.map(p => p.id);

    // Obtener testimonios aprobados de todos los proyectos del usuario
    const testimonials = await prisma.testimonial.findMany({
      where: {
        projectId: { in: projectIds },
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      take: widget.maxItems || 10,
    });

    const widgetData = {
      id: widget.id,
      type: widget.type,
      theme: widget.theme,
      primaryColor: widget.primaryColor,
      bgColor: widget.bgColor,
      textColor: widget.textColor,
      borderRadius: widget.borderRadius,
      showBranding: widget.showBranding,
      columns: widget.columns,
      testimonials: testimonials.map(t => ({
        id: t.id,
        text: t.text,
        authorName: t.authorName,
        authorCompany: t.authorCompany,
        authorTitle: t.authorTitle,
        rating: t.rating,
      })),
    };

    const script = generateWidgetScript(widgetId, widgetData);

    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("// Error loading widget", {
      headers: { "Content-Type": "application/javascript" },
    });
  }
}

function generateWidgetScript(widgetId: string, data: object): string {
  return `
(function() {
  const WIDGET_DATA = ${JSON.stringify(data)};
  const container = document.querySelector('[data-testimonio-widget="${widgetId}"]');
  if (!container) return;

  // Styles - Compact version
  const styles = document.createElement('style');
  styles.textContent = \`
    .tm-widget {
      font-family: system-ui, -apple-system, sans-serif;
      --tm-primary: \${WIDGET_DATA.primaryColor};
      --tm-bg: \${WIDGET_DATA.bgColor};
      --tm-text: \${WIDGET_DATA.textColor};
      --tm-radius: \${WIDGET_DATA.borderRadius}px;
      max-width: 100%;
    }
    .tm-card {
      background: var(--tm-bg);
      border-radius: var(--tm-radius);
      padding: 16px 20px;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: inline-block;
      max-width: 400px;
      width: 100%;
    }
    .tm-stars { color: #f59e0b; font-size: 12px; margin-bottom: 8px; letter-spacing: 1px; }
    .tm-text { 
      font-size: 14px; 
      color: var(--tm-text); 
      line-height: 1.5; 
      margin-bottom: 12px;
      margin: 0 0 12px 0;
    }
    .tm-text::before { content: '"'; }
    .tm-text::after { content: '"'; }
    .tm-author { display: flex; align-items: center; gap: 10px; }
    .tm-avatar { 
      width: 36px; 
      height: 36px; 
      border-radius: 50%; 
      background: linear-gradient(135deg, var(--tm-primary), #d97706); 
      color: white; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 600; 
      font-size: 12px;
      flex-shrink: 0;
    }
    .tm-info { flex: 1; min-width: 0; }
    .tm-name { font-weight: 600; color: var(--tm-text); font-size: 13px; }
    .tm-company { font-size: 11px; color: var(--tm-text); opacity: 0.6; }
    .tm-powered { text-align: center; margin-top: 12px; font-size: 10px; opacity: 0.4; }
    .tm-powered a { color: inherit; text-decoration: none; }
    .tm-powered a:hover { color: var(--tm-primary); }
    .tm-empty { text-align: center; padding: 20px; color: #64748b; font-size: 13px; }
    
    /* Carousel specific */
    .tm-carousel { position: relative; overflow: hidden; max-width: 400px; }
    .tm-carousel-track { display: flex; transition: transform 0.4s ease; }
    .tm-carousel-slide { min-width: 100%; box-sizing: border-box; }
    .tm-carousel-slide .tm-card { max-width: 100%; display: block; }
    .tm-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
    .tm-dot { 
      width: 6px; height: 6px; border-radius: 50%; 
      background: var(--tm-text); opacity: 0.2;
      cursor: pointer; border: none; transition: all 0.2s; padding: 0;
    }
    .tm-dot.active { opacity: 1; background: var(--tm-primary); }
    .tm-nav { 
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 28px; height: 28px; border-radius: 50%;
      background: white; border: 1px solid rgba(0,0,0,0.1);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: var(--tm-text); z-index: 10;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 0;
    }
    .tm-nav:hover { background: var(--tm-bg); }
    .tm-nav-prev { left: 4px; }
    .tm-nav-next { right: 4px; }
    
    /* Grid specific */
    .tm-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
      gap: 12px; 
    }
    .tm-grid .tm-card { max-width: 100%; display: block; }
    
    /* Wall (Masonry) specific */
    .tm-wall { 
      columns: 3;
      column-gap: 12px;
    }
    @media (max-width: 900px) { .tm-wall { columns: 2; } }
    @media (max-width: 600px) { .tm-wall { columns: 1; } }
    .tm-wall .tm-card { 
      break-inside: avoid; 
      margin-bottom: 12px;
      max-width: 100%;
      display: block;
    }

    /* Single - centered */
    .tm-single { display: flex; justify-content: center; }
  \`;
  document.head.appendChild(styles);

  if (WIDGET_DATA.testimonials.length === 0) {
    container.innerHTML = '<div class="tm-widget"><div class="tm-card tm-empty">No hay testimonios todavía</div></div>';
    return;
  }

  function renderCard(t) {
    const initials = t.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return \`
      <div class="tm-card">
        <div class="tm-stars">\${'★'.repeat(t.rating || 5)}\${'☆'.repeat(5 - (t.rating || 5))}</div>
        <p class="tm-text">\${t.text}</p>
        <div class="tm-author">
          <div class="tm-avatar">\${initials}</div>
          <div class="tm-info">
            <div class="tm-name">\${t.authorName}</div>
            \${t.authorCompany || t.authorTitle ? \`<div class="tm-company">\${[t.authorTitle, t.authorCompany].filter(Boolean).join(' · ')}</div>\` : ''}
          </div>
        </div>
      </div>
    \`;
  }

  function renderBranding() {
    if (!WIDGET_DATA.showBranding) return '';
    return '<div class="tm-powered"><a href="https://testimon-io.vercel.app" target="_blank">Powered by TestimonIO</a></div>';
  }

  // Render based on type
  if (WIDGET_DATA.type === 'GRID') {
    container.innerHTML = \`
      <div class="tm-widget">
        <div class="tm-grid">
          \${WIDGET_DATA.testimonials.map(renderCard).join('')}
        </div>
        \${renderBranding()}
      </div>
    \`;
  } 
  else if (WIDGET_DATA.type === 'WALL') {
    container.innerHTML = \`
      <div class="tm-widget">
        <div class="tm-wall">
          \${WIDGET_DATA.testimonials.map(renderCard).join('')}
        </div>
        \${renderBranding()}
      </div>
    \`;
  }
  else if (WIDGET_DATA.type === 'SINGLE') {
    const t = WIDGET_DATA.testimonials[0];
    container.innerHTML = \`
      <div class="tm-widget">
        <div class="tm-single">
          \${renderCard(t)}
        </div>
        \${renderBranding()}
      </div>
    \`;
  }
  else {
    // CAROUSEL (default)
    let currentIndex = 0;
    
    function renderCarousel() {
      container.innerHTML = \`
        <div class="tm-widget">
          <div class="tm-carousel">
            \${WIDGET_DATA.testimonials.length > 1 ? '<button class="tm-nav tm-nav-prev">‹</button>' : ''}
            <div class="tm-carousel-track" style="transform: translateX(-\${currentIndex * 100}%)">
              \${WIDGET_DATA.testimonials.map(t => \`<div class="tm-carousel-slide">\${renderCard(t)}</div>\`).join('')}
            </div>
            \${WIDGET_DATA.testimonials.length > 1 ? '<button class="tm-nav tm-nav-next">›</button>' : ''}
          </div>
          \${WIDGET_DATA.testimonials.length > 1 ? \`
            <div class="tm-dots">
              \${WIDGET_DATA.testimonials.map((_, i) => \`<button class="tm-dot \${i === currentIndex ? 'active' : ''}" data-index="\${i}"></button>\`).join('')}
            </div>
          \` : ''}
          \${renderBranding()}
        </div>
      \`;

      // Event listeners
      container.querySelectorAll('.tm-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          currentIndex = parseInt(e.target.dataset.index);
          renderCarousel();
        });
      });
      
      const prevBtn = container.querySelector('.tm-nav-prev');
      const nextBtn = container.querySelector('.tm-nav-next');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : WIDGET_DATA.testimonials.length - 1;
          renderCarousel();
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          currentIndex = (currentIndex + 1) % WIDGET_DATA.testimonials.length;
          renderCarousel();
        });
      }
    }

    renderCarousel();

    // Auto-advance
    if (WIDGET_DATA.testimonials.length > 1) {
      setInterval(() => {
        currentIndex = (currentIndex + 1) % WIDGET_DATA.testimonials.length;
        renderCarousel();
      }, 6000);
    }
  }
})();
`;
}
