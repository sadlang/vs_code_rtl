import * as vscode from 'vscode';
import { RtlController } from './core/RtlController';
import { RtlResult } from './core/RtlStrategy';
import { StrategyRegistry } from './core/StrategyRegistry';
import { Settings } from './config/Settings';
import { MementoState } from './state/MementoState';
import { StatusBar } from './ui/StatusBar';
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

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const controller = new RtlController(
    buildRegistry(),
    new Settings(),
    new MementoState(context.globalState),
  );

  const statusBar = new StatusBar();
  context.subscriptions.push(statusBar);

  const refreshStatus = async () => {
    try {
      statusBar.update(await controller.isEnabled());
    } catch {
      /* تجاهُل: لا نُفشل التحديث بسبب تعذّر القراءة. */
    }
  };

  const run = (action: () => Promise<RtlResult>) => async () => {
    try {
      await report(await action());
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`VS Code RTL: ${reason}`);
    } finally {
      await refreshStatus();
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('vsCodeRtl.enable', run(() => controller.enable())),
    vscode.commands.registerCommand('vsCodeRtl.disable', run(() => controller.disable())),
    vscode.commands.registerCommand('vsCodeRtl.toggle', run(() => controller.toggle())),
    vscode.commands.registerCommand('vsCodeRtl.reapply', run(() => controller.enable())),
  );

  await refreshStatus();
  await handleDrift(controller);
}

export function deactivate(): void {
  // لا حاجة لتنظيف: التغييرات تُكتب على القرص وتُدار عبر الأوامر صراحةً.
}

/**
 * عند الإقلاع: إن كان المستخدم قد فعّل RTL لكنّ تحديث VS Code محا الحقن،
 * يُقترح إعادة التطبيق.
 */
async function handleDrift(controller: RtlController): Promise<void> {
  if ((await controller.checkDrift()) !== 'drift') {
    return;
  }
  const reapply = 'إعادة التطبيق';
  const choice = await vscode.window.showWarningMessage(
    'VS Code RTL: يبدو أنّ تحديث VS Code ألغى وضع RTL. هل تريد إعادة تطبيقه؟',
    reapply,
  );
  if (choice === reapply) {
    await report(await controller.enable());
  }
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
