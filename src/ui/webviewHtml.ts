/** نموذج محتوى سطح RTL — قابل للتوسّع بإضافة عناصر. */
export interface RtlSurfaceModel {
  title: string;
  intro: string;
  /** بنود تُعرض كقائمة (نقاط/مزايا/روابط نصّية). */
  items: string[];
}

/** يهرّب نصًّا لإدراجه بأمان داخل HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * يولّد صفحة HTML كاملة لسطح RTL أصليّ داخل webview.
 * دالة نقيّة قابلة للاختبار — لا تعتمد على vscode.
 * تستخدم متغيّرات سمة VS Code لتندمج بصريًّا مع المحرّر.
 */
export function renderRtlHtml(model: RtlSurfaceModel): string {
  const items = model.items.map((i) => `      <li>${escapeHtml(i)}</li>`).join('\n');
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src 'unsafe-inline';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(model.title)}</title>
  <style>
    body {
      direction: rtl;
      text-align: right;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 1.5rem 2rem;
      line-height: 1.7;
    }
    h1 { color: var(--vscode-textLink-foreground); margin-top: 0; }
    ul { padding-inline-start: 1.2rem; }
    .intro { opacity: 0.85; }
  </style>
</head>
<body>
  <h1>${escapeHtml(model.title)}</h1>
  <p class="intro">${escapeHtml(model.intro)}</p>
  <ul>
${items}
  </ul>
</body>
</html>`;
}
