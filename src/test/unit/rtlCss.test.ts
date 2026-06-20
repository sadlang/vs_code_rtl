import * as assert from 'assert';
import {
  generateRtlCss,
  hasRtlCss,
  stripRtlCss,
  RTL_MARKER_START,
  RTL_MARKER_END,
} from '../../strategies/rtlCss';

describe('rtlCss', () => {
  describe('generateRtlCss', () => {
    it('يضع علامتَي البداية والنهاية', () => {
      const css = generateRtlCss({ scope: 'workbench', keepEditorLtr: true });
      assert.ok(css.startsWith(RTL_MARKER_START));
      assert.ok(css.trimEnd().endsWith(RTL_MARKER_END));
    });

    it('يطبّق RTL على .monaco-workbench دائمًا', () => {
      const css = generateRtlCss({ scope: 'workbench', keepEditorLtr: false });
      assert.match(css, /\.monaco-workbench\s*\{\s*direction:\s*rtl/);
    });

    it('يضيف قاعدة body عند النطاق all فقط', () => {
      const all = generateRtlCss({ scope: 'all', keepEditorLtr: true });
      const wb = generateRtlCss({ scope: 'workbench', keepEditorLtr: true });
      assert.match(all, /body\s*\{\s*direction:\s*rtl/);
      assert.doesNotMatch(wb, /body\s*\{\s*direction:\s*rtl/);
    });

    it('يُبقي المحرّر LTR عند تفعيل keepEditorLtr', () => {
      const keep = generateRtlCss({ scope: 'workbench', keepEditorLtr: true });
      const dont = generateRtlCss({ scope: 'workbench', keepEditorLtr: false });
      assert.match(keep, /\.monaco-editor[\s\S]*direction:\s*ltr/);
      assert.doesNotMatch(dont, /direction:\s*ltr/);
    });
  });

  describe('stripRtlCss / hasRtlCss', () => {
    it('يكتشف الكتلة المحقونة', () => {
      const css = generateRtlCss({ scope: 'workbench', keepEditorLtr: true });
      assert.strictEqual(hasRtlCss(`.x{} ${css}`), true);
      assert.strictEqual(hasRtlCss('.x{}'), false);
    });

    it('يزيل الكتلة ويُبقي المحتوى الأصليّ', () => {
      const base = '.original { color: red; }';
      const css = generateRtlCss({ scope: 'workbench', keepEditorLtr: true });
      const combined = `${base}\n${css}\n`;
      const stripped = stripRtlCss(combined);
      assert.ok(stripped.includes(base));
      assert.strictEqual(hasRtlCss(stripped), false);
    });

    it('عمليّة الإزالة عاطلة (idempotent) على محتوى نظيف', () => {
      const base = '.original {}';
      assert.strictEqual(stripRtlCss(base), base);
    });

    it('حقن ثمّ إزالة يعيد المحتوى الأصليّ تقريبًا', () => {
      const base = '.original {}';
      const css = generateRtlCss({ scope: 'all', keepEditorLtr: false });
      const stripped = stripRtlCss(`${base}\n${css}`);
      assert.strictEqual(stripped.trim(), base.trim());
    });
  });
});
