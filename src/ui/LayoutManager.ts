import * as vscode from 'vscode';

/**
 * يخفي/يستعيد عناصر هيكل VS Code الأصليّة عبر إعدادات رسميّة قابلة للعكس.
 * يحفظ القيم السابقة لاستعادتها لاحقًا.
 */
export class LayoutManager {
  private previous: { activityBar?: string; statusBar?: boolean } = {};

  /** يخفي شريط الأنشطة وشريط الحالة، بعد حفظ حالتهما. */
  async hide(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('workbench');
    this.previous = {
      activityBar: cfg.get<string>('activityBar.location'),
      statusBar: cfg.get<boolean>('statusBar.visible'),
    };
    await cfg.update('activityBar.location', 'hidden', vscode.ConfigurationTarget.Global);
    await cfg.update('statusBar.visible', false, vscode.ConfigurationTarget.Global);
  }

  /** يستعيد القيم المحفوظة (أو يمسح الإعداد ليعود للافتراضيّ). */
  async restore(): Promise<void> {
    const cfg = vscode.workspace.getConfiguration('workbench');
    await cfg.update(
      'activityBar.location',
      this.previous.activityBar,
      vscode.ConfigurationTarget.Global,
    );
    await cfg.update(
      'statusBar.visible',
      this.previous.statusBar,
      vscode.ConfigurationTarget.Global,
    );
  }
}
