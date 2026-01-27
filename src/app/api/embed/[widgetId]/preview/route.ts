import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params;
  const baseUrl = new URL(request.url).origin;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Widget - Testimonio</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 40px 20px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      min-height: 100vh;
      margin: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 8px;
    }
    p {
      color: #666;
      margin-bottom: 24px;
    }
    .widget-container {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .code-section {
      margin-top: 32px;
      background: #1a1a1a;
      border-radius: 12px;
      padding: 20px;
    }
    .code-section h3 {
      color: #fff;
      font-size: 14px;
      margin: 0 0 12px 0;
    }
    pre {
      background: #2d2d2d;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 0;
    }
    code {
      color: #a5d6ff;
      font-size: 13px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Preview del Widget</h1>
    <p>Así se verá el widget en tu sitio web:</p>
    
    <div class="widget-container">
      <div data-testimonio-widget="${widgetId}"></div>
    </div>
    
    <div class="code-section">
      <h3>📋 Código para copiar:</h3>
      <pre><code>&lt;div data-testimonio-widget="${widgetId}"&gt;&lt;/div&gt;
&lt;script src="${baseUrl}/api/embed/${widgetId}" async&gt;&lt;/script&gt;</code></pre>
    </div>
  </div>
  
  <script src="${baseUrl}/api/embed/${widgetId}" async></script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
