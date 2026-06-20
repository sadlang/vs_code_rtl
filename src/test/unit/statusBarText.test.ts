import * as assert from 'assert';
import { statusBarContent } from '../../ui/statusBarText';

describe('statusBarContent', () => {
  it('يعرض سهم اليسار ونصّ RTL عند التفعيل', () => {
    const c = statusBarContent(true);
    assert.match(c.text, /arrow-left/);
    assert.match(c.text, /RTL/);
    assert.match(c.tooltip, /مفعَّل/);
  });

  it('يعرض سهم اليمين ونصّ LTR عند التعطيل', () => {
    const c = statusBarContent(false);
    assert.match(c.text, /arrow-right/);
    assert.match(c.text, /LTR/);
    assert.match(c.tooltip, /معطَّل/);
  });
});
