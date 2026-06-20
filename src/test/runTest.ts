import * as path from 'path';
import { runTests } from '@vscode/test-electron';

/**
 * يُنزّل نسخة VS Code للاختبار ويشغّل مجموعة اختبارات التكامل داخلها.
 */
async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('فشل تشغيل اختبارات التكامل:', err);
    process.exit(1);
  }
}

void main();
