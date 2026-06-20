import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import { CssInjectionStrategy } from '../../strategies/CssInjectionStrategy';
import { RtlOptions } from '../../core/RtlStrategy';

const OPTIONS: RtlOptions = { scope: 'workbench', keepEditorLtr: true };

describe('CssInjectionStrategy', () => {
  let tmpFile: string;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtl-test-'));
    tmpFile = path.join(dir, 'workbench.css');
    fs.writeFileSync(tmpFile, '.original { color: red; }\n', 'utf8');
  });

  afterEach(() => {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  });

  it('enable يحقن الكتلة ويطلب إعادة التحميل', async () => {
    const strategy = new CssInjectionStrategy(() => tmpFile);
    const result = await strategy.enable(OPTIONS);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.requiresReload, true);
    assert.strictEqual(await strategy.isEnabled(), true);
    assert.match(await fsp.readFile(tmpFile, 'utf8'), /\.original/);
  });

  it('enable مرّتين لا يضاعف الكتلة', async () => {
    const strategy = new CssInjectionStrategy(() => tmpFile);
    await strategy.enable(OPTIONS);
    await strategy.enable(OPTIONS);
    const content = await fsp.readFile(tmpFile, 'utf8');
    const occurrences = content.split('vs-code-rtl: BEGIN').length - 1;
    assert.strictEqual(occurrences, 1);
  });

  it('disable يزيل الكتلة', async () => {
    const strategy = new CssInjectionStrategy(() => tmpFile);
    await strategy.enable(OPTIONS);
    const result = await strategy.disable();
    assert.strictEqual(result.success, true);
    assert.strictEqual(await strategy.isEnabled(), false);
    assert.match(await fsp.readFile(tmpFile, 'utf8'), /\.original/);
  });

  it('disable على ملفّ غير مفعّل لا يطلب إعادة تحميل', async () => {
    const strategy = new CssInjectionStrategy(() => tmpFile);
    const result = await strategy.disable();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.requiresReload, false);
  });

  it('يفشل بلطف عند غياب الملفّ المستهدَف', async () => {
    const strategy = new CssInjectionStrategy(() => undefined);
    const result = await strategy.enable(OPTIONS);
    assert.strictEqual(result.success, false);
    assert.strictEqual(await strategy.isEnabled(), false);
  });
});
