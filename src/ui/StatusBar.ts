import * as vscode from 'vscode';
import { statusBarContent } from './statusBarText';

/** يدير عنصر شريط الحالة الذي يعرض وضع RTL ويبدّله عند النقر. */
export class StatusBar {
  private readonly item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.item.command = 'vsCodeRtl.toggle';
    this.item.show();
  }

  /** يحدّث المظهر وفق حالة التفعيل الفعليّة. */
  update(enabled: boolean): void {
    const { text, tooltip } = statusBarContent(enabled);
    this.item.text = text;
    this.item.tooltip = tooltip;
  }

  dispose(): void {
    this.item.dispose();
  }
}
