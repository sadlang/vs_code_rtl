import * as assert from 'assert';
import { renderRtlHtml, escapeHtml, RtlSurfaceModel } from '../../ui/webviewHtml';

const model: RtlSurfaceModel = {
  title: 'عنوان السطح',
  intro: 'مقدّمة موجزة',
  items: ['بند أوّل', 'بند ثانٍ'],
};

describe('webviewHtml', () => {
  describe('renderRtlHtml', () => {
    const html = renderRtlHtml(model);

    it('يضبط اتجاه المستند على RTL ولغته على العربية', () => {
      assert.match(html, /<html dir="rtl" lang="ar">/);
    });

    it('يتضمّن سياسة أمان المحتوى (CSP)', () => {
      assert.match(html, /Content-Security-Policy/);
      assert.match(html, /default-src 'none'/);
    });

    it('يعرض العنوان والمقدّمة والبنود', () => {
      assert.ok(html.includes('عنوان السطح'));
      assert.ok(html.includes('مقدّمة موجزة'));
      assert.ok(html.includes('بند أوّل'));
      assert.ok(html.includes('بند ثانٍ'));
    });

    it('يهرّب محتوى البنود لمنع حقن HTML', () => {
      const out = renderRtlHtml({ ...model, items: ['<script>x</script>'] });
      assert.ok(!out.includes('<script>x</script>'));
      assert.ok(out.includes('&lt;script&gt;'));
    });
  });

  describe('escapeHtml', () => {
    it('يهرّب المحارف الخاصّة', () => {
      assert.strictEqual(escapeHtml('<a&b">'), '&lt;a&amp;b&quot;&gt;');
    });
  });
});
