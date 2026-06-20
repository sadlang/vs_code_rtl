import * as assert from 'assert';
import { StrategyRegistry } from '../../core/StrategyRegistry';
import { RtlStrategy, RtlResult } from '../../core/RtlStrategy';

function fakeStrategy(id: string): RtlStrategy {
  const ok: RtlResult = { success: true, requiresReload: false, message: 'ok' };
  return {
    id,
    displayName: id,
    enable: async () => ok,
    disable: async () => ok,
    isEnabled: async () => false,
  };
}

describe('StrategyRegistry', () => {
  it('يسجّل ويسترجع بالمعرّف', () => {
    const reg = new StrategyRegistry();
    const s = fakeStrategy('a');
    reg.register(s);
    assert.strictEqual(reg.get('a'), s);
    assert.strictEqual(reg.has('a'), true);
  });

  it('يرمي خطأً عند تكرار المعرّف', () => {
    const reg = new StrategyRegistry();
    reg.register(fakeStrategy('dup'));
    assert.throws(() => reg.register(fakeStrategy('dup')), /مسجّلة مسبقًا/);
  });

  it('يُرجع undefined لمعرّف غير موجود', () => {
    const reg = new StrategyRegistry();
    assert.strictEqual(reg.get('missing'), undefined);
    assert.strictEqual(reg.has('missing'), false);
  });

  it('يعدّد المعرّفات والاستراتيجيات', () => {
    const reg = new StrategyRegistry();
    reg.register(fakeStrategy('x'));
    reg.register(fakeStrategy('y'));
    assert.deepStrictEqual(reg.ids().sort(), ['x', 'y']);
    assert.strictEqual(reg.all().length, 2);
  });
});
