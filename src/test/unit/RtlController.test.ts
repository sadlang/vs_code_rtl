import * as assert from 'assert';
import { RtlController } from '../../core/RtlController';
import { StrategyRegistry } from '../../core/StrategyRegistry';
import { RtlState } from '../../core/RtlState';
import { RtlStrategy, RtlResult } from '../../core/RtlStrategy';

class FakeState implements RtlState {
  constructor(private enabled = false) {}
  isEnabled(): boolean {
    return this.enabled;
  }
  async setEnabled(value: boolean): Promise<void> {
    this.enabled = value;
  }
}

/** استراتيجية وهميّة بحالة قرص قابلة للضبط. */
function fakeStrategy(diskEnabled: boolean, succeed = true): RtlStrategy {
  let enabled = diskEnabled;
  const result = (): RtlResult => ({ success: succeed, requiresReload: false, message: '' });
  return {
    id: 'cssInjection',
    displayName: 'fake',
    enable: async () => {
      if (succeed) {
        enabled = true;
      }
      return result();
    },
    disable: async () => {
      if (succeed) {
        enabled = false;
      }
      return result();
    },
    isEnabled: async () => enabled,
  };
}

function controllerWith(strategy: RtlStrategy, state: RtlState): RtlController {
  const registry = new StrategyRegistry();
  registry.register(strategy);
  const settings = { strategyId: 'cssInjection', options: { scope: 'workbench', keepEditorLtr: true } };
  return new RtlController(registry, settings as never, state);
}

describe('RtlController', () => {
  it('enable يضبط النيّة على true عند النجاح', async () => {
    const state = new FakeState(false);
    const ctrl = controllerWith(fakeStrategy(false), state);
    await ctrl.enable();
    assert.strictEqual(state.isEnabled(), true);
  });

  it('لا يضبط النيّة عند فشل الاستراتيجية', async () => {
    const state = new FakeState(false);
    const ctrl = controllerWith(fakeStrategy(false, false), state);
    await ctrl.enable();
    assert.strictEqual(state.isEnabled(), false);
  });

  it('toggle يعكس الحالة الفعليّة على القرص', async () => {
    const state = new FakeState(false);
    const ctrl = controllerWith(fakeStrategy(false), state);
    const r = await ctrl.toggle();
    assert.strictEqual(r.success, true);
    assert.strictEqual(await ctrl.isEnabled(), true);
  });

  describe('checkDrift', () => {
    it('drift: النيّة تفعيل لكنّ القرص معطَّل', async () => {
      const ctrl = controllerWith(fakeStrategy(false), new FakeState(true));
      assert.strictEqual(await ctrl.checkDrift(), 'drift');
    });

    it('stale: النيّة تعطيل لكنّ القرص مفعَّل', async () => {
      const ctrl = controllerWith(fakeStrategy(true), new FakeState(false));
      assert.strictEqual(await ctrl.checkDrift(), 'stale');
    });

    it('ok: النيّة والقرص متطابقان', async () => {
      const ctrl = controllerWith(fakeStrategy(true), new FakeState(true));
      assert.strictEqual(await ctrl.checkDrift(), 'ok');
    });
  });
});
