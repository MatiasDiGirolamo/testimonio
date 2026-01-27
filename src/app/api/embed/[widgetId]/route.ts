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

    // Obtener testimonios aprobados del proyecto
    const testimonials = await prisma.testimonial.findMany({
      where: {
        projectId: widget.projectId,
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

function generateWidgetScript(widgetId: string, data: any): string {
  return `
(function() {
  const WIDGET_DATA = ${JSON.stringify(data)};
  const container = document.querySelector('[data-testimonio-widget="${widgetId}"]');
  if (!container) return;

  // Styles
  const styles = document.createElement('style');
  styles.textContent = \`
    .tm-widget {
      font-family: system-ui, -apple-system, sans-serif;
      --tm-primary: \${WIDGET_DATA.primaryColor};
      --tm-bg: \${WIDGET_DATA.bgColor};
      --tm-text: \${WIDGET_DATA.textColor};
      --tm-radius: \${WIDGET_DATA.borderRadius}px;
    }
    .tm-card {
      background: var(--tm-bg);
      border-radius: var(--tm-radius);
      padding: 24px;
      border: 1px solid rgba(0,0,0,0.08);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .tm-stars { color: #f59e0b; font-size: 14px; margin-bottom: 12px; letter-spacing: 2px; }
    .tm-text { 
      font-size: 16px; 
      color: var(--tm-text); 
      line-height: 1.7; 
      margin-bottom: 16px;
    }
    .tm-text::before { content: '"'; }
    .tm-text::after { content: '"'; }
    .tm-author { display: flex; align-items: center; gap: 12px; }
    .tm-avatar { 
      width: 44px; 
      height: 44px; 
      border-radius: 50%; 
      background: linear-gradient(135deg, var(--tm-primary), #d97706); 
      color: white; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 600; 
      font-size: 14px;
    }
    .tm-info { flex: 1; }
    .tm-name { font-weight: 600; color: var(--tm-text); font-size: 15px; }
    .tm-company { font-size: 13px; color: var(--tm-text); opacity: 0.6; }
    .tm-powered { text-align: center; margin-top: 16px; font-size: 12px; opacity: 0.5; }
    .tm-powered a { color: inherit; text-decoration: none; }
    .tm-powered a:hover { color: var(--tm-primary); }
    .tm-empty { text-align: center; padding: 32px; color: #64748b; }
    
    /* Carousel specific */
    .tm-carousel { position: relative; overflow: hidden; }
    .tm-carousel-track { display: flex; transition: transform 0.5s ease; }
    .tm-carousel-slide { min-width: 100%; padding: 0 4px; box-sizing: border-box; }
    .tm-dots { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
    .tm-dot { 
      width: 8px; height: 8px; border-radius: 50%; 
      background: var(--tm-text); opacity: 0.2;
      cursor: pointer; border: none; transition: all 0.2s; 
    }
    .tm-dot.active { opacity: 1; background: var(--tm-primary); }
    .tm-nav { 
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 36px; height: 36px; border-radius: 50%;
      background: white; border: 1px solid rgba(0,0,0,0.1);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: var(--tm-text); z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .tm-nav:hover { background: var(--tm-bg); }
    .tm-nav-prev { left: 8px; }
    .tm-nav-next { right: 8px; }
    
    /* Grid specific */
    .tm-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: 16px; 
    }
    
    /* Wall (Masonry) specific */
    .tm-wall { 
      columns: 3;
      column-gap: 16px;
    }
    @media (max-width: 900px) { .tm-wall { columns: 2; } }
    @media (max-width: 600px) { .tm-wall { columns: 1; } }
    .tm-wall .tm-card { 
      break-inside: avoid; 
      margin-bottom: 16px;
    }
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
    return '<div class="tm-powered"><a href="https://testimonio.app" target="_blank">Powered by Testimonio</a></div>';
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
        \${renderCard(t)}
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
