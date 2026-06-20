import * as vscode from 'vscode';
import { RtlController } from './core/RtlController';
import { RtlResult } from './core/RtlStrategy';
import { StrategyRegistry } from './core/StrategyRegistry';
import { Settings } from './config/Settings';
import { CssInjectionStrategy } from './strategies/CssInjectionStrategy';
import { findWorkbenchCss } from './strategies/workbenchPaths';

/**
 * يبني سجلّ الاستراتيجيات. نقطة التسجيل الوحيدة — أضف استراتيجياتك هنا.
 */
export function buildRegistry(): StrategyRegistry {
  const registry = new StrategyRegistry();
  registry.register(new CssInjectionStrategy(() => findWorkbenchCss(vscode.env.appRoot)));
  return registry;
}

export function activate(context: vscode.ExtensionContext): void {
  const controller = new RtlController(buildRegistry(), new Settings());

  const run = (action: () => Promise<RtlResult>) => async () => {
    try {
      await report(await action());
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`VS Code RTL: ${reason}`);
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('vsCodeRtl.enable', run(() => controller.enable())),
    vscode.commands.registerCommand('vsCodeRtl.disable', run(() => controller.disable())),
    vscode.commands.registerCommand('vsCodeRtl.toggle', run(() => controller.toggle())),
    vscode.commands.registerCommand('vsCodeRtl.reapply', run(() => controller.enable())),
  );
}

export function deactivate(): void {
  // لا حاجة لتنظيف: التغييرات تُكتب على القرص وتُدار عبر الأوامر صراحةً.
}

/** يعرض نتيجة العمليّة، ويقترح إعادة تحميل النافذة عند الحاجة. */
async function report(result: RtlResult): Promise<void> {
  if (!result.success) {
    vscode.window.showErrorMessage(`VS Code RTL: ${result.message}`);
    return;
  }
  if (result.requiresReload) {
    const reload = 'إعادة التحميل الآن';
    const choice = await vscode.window.showInformationMessage(
      `VS Code RTL: ${result.message}`,
      reload,
    );
    if (choice === reload) {
      await vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
  } else {
    vscode.window.showInformationMessage(`VS Code RTL: ${result.message}`);
  }
}
