import { RtlOptions } from '../core/RtlStrategy';

/** علامتا بداية ونهاية الكتلة المحقونة — تُستخدمان للحقن والإزالة بدقّة. */
export const RTL_MARKER_START = '/* >>> vs-code-rtl: BEGIN (لا تُعدّل يدويًا) >>> */';
export const RTL_MARKER_END = '/* <<< vs-code-rtl: END <<< */';

/**
 * يولّد كتلة CSS تطبّق اتجاه RTL على واجهة VS Code وفق الخيارات.
 * دالة نقيّة بلا أثر جانبيّ — وحدة الاختبار الأساسية.
 */
export function generateRtlCss(options: RtlOptions): string {
  const rules: string[] = [];

  if (options.scope === 'all') {
    rules.push('body { direction: rtl !important; }');
  }

  // واجهة العمل: الأشرطة الجانبية واللوحات والشريط النشط.
  rules.push('.monaco-workbench { direction: rtl !important; }');

  if (options.keepEditorLtr) {
    // إبقاء محتوى المحرّر LTR حتى لا ينقلب اتجاه الشيفرة.
    rules.push('.monaco-workbench .editor-instance,');
    rules.push('.monaco-workbench .monaco-editor,');
    rules.push('.monaco-workbench .monaco-editor .view-lines { direction: ltr !important; }');
  }

  const body = rules.map((r) => `  ${r}`).join('\n');
  return `${RTL_MARKER_START}\n${body}\n${RTL_MARKER_END}`;
}

/** يزيل أيّ كتلة محقونة سابقًا من محتوى ملفّ، ويُعيد الباقي مُنظَّفًا. */
export function stripRtlCss(content: string): string {
  const start = content.indexOf(RTL_MARKER_START);
  const end = content.indexOf(RTL_MARKER_END);
  if (start === -1 || end === -1 || end < start) {
    return content;
  }
  const before = content.slice(0, start);
  const after = content.slice(end + RTL_MARKER_END.length);
  return (before + after).replace(/\n{3,}/g, '\n\n');
}

/** هل يحتوي المحتوى على كتلة RTL محقونة؟ */
export function hasRtlCss(content: string): boolean {
  return content.includes(RTL_MARKER_START) && content.includes(RTL_MARKER_END);
}
