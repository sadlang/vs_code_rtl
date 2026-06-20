import * as path from 'path';
import * as fs from 'fs';

/**
 * أسماء ملفّات CSS المحتملة لواجهة VS Code عبر الإصدارات.
 * يُجرَّب الأوّل المتوفّر منها.
 */
const CANDIDATE_CSS_FILES = [
  'vs/workbench/workbench.desktop.main.css',
  'vs/workbench/workbench.web.main.css',
];

/**
 * يحدّد ملفّ CSS الخاص بواجهة العمل داخل تثبيت VS Code.
 * @param appRoot جذر التطبيق (`vscode.env.appRoot`).
 * @returns المسار المطلق لأوّل ملفّ موجود، أو undefined إن لم يُعثَر على أيّ منها.
 */
export function findWorkbenchCss(appRoot: string): string | undefined {
  for (const rel of CANDIDATE_CSS_FILES) {
    const candidate = path.join(appRoot, 'out', rel);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}
