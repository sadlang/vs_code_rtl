import * as assert from 'assert';
import * as vscode from 'vscode';
import { buildRegistry } from '../../extension';

describe('تكامل الإضافة', () => {
  it('تُسجَّل أوامر RTL', async () => {
    const commands = await vscode.commands.getCommands(true);
    for (const cmd of ['enable', 'disable', 'toggle', 'reapply']) {
      assert.ok(
        commands.includes(`vsCodeRtl.${cmd}`),
        `الأمر vsCodeRtl.${cmd} غير مسجّل`,
      );
    }
  });

  it('السجلّ يحوي استراتيجية cssInjection', () => {
    const registry = buildRegistry();
    assert.ok(registry.has('cssInjection'));
  });
});
