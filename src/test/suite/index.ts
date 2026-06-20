import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

/** نقطة دخول مجموعة اختبارات التكامل التي تُشغَّل داخل VS Code. */
export async function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'bdd', color: true, timeout: 20000 });
  const testsRoot = path.resolve(__dirname, '.');

  const files = await glob('**/*.test.js', { cwd: testsRoot });
  files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

  await new Promise<void>((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} اختبار(ات) فشلت.`));
      } else {
        resolve();
      }
    });
  });
}
