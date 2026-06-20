import * as vscode from 'vscode';
import { RtlOptions, RtlResult, RtlStrategy } from '../core/RtlStrategy';
import { LayoutManager } from '../ui/LayoutManager';
import { renderRtlHtml } from '../ui/webviewHtml';

/**
 * استراتيجية آمنة: تفتح سطح RTL أصليًّا داخل لوحة webview (مدعوم رسميًّا)
 * دون تعديل ملفّات تثبيت VS Code. اختياريًّا تخفي الهيكل الأصليّ عبر
 * {@link LayoutManager} لتقريب التجربة من «واجهة بديلة».
 *
 * أثرها لا يبقى بعد إعادة التحميل (`survivesReload = false`) — تُعاد فتحها
 * تلقائيًّا عند الإقلاع إن كانت النيّة مفعّلة.
 */
export class WebviewRtlStrategy implements RtlStrategy {
  readonly id = 'webview';
  readonly displayName = 'سطح webview بالـRTL (آمن)';
  readonly survivesReload = false;

  private panel?: vscode.WebviewPanel;

  constructor(private readonly layout: LayoutManager) {}

  async enable(options: RtlOptions): Promise<RtlResult> {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        'vsCodeRtl.surface',
        'واجهة RTL',
        vscode.ViewColumn.One,
        { enableScripts: false, retainContextWhenHidden: true },
      );
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }
    this.panel.webview.html = renderRtlHtml({
      title: 'واجهة RTL أصليّة',
      intro:
        'هذا السطح يعمل باتجاه «من اليمين إلى اليسار» أصليًّا داخل VS Code، ' +
        'دون تعديل ملفّات التثبيت — آمن ويصمد عبر التحديثات.',
      items: [
        'اتجاه RTL مضبوط على عنصر <html dir="rtl">.',
        'يندمج بصريًّا مع سمة المحرّر عبر متغيّرات VS Code.',
        options.hideNativeChrome
          ? 'الهيكل الأصليّ مُخفى لإفساح المجال لهذا السطح.'
          : 'يمكن إخفاء الهيكل الأصليّ من إعداد vsCodeRtl.hideNativeChrome.',
        'قابل للتوسّع: أضف عناصرك إلى نموذج المحتوى RtlSurfaceModel.',
      ],
    });
    this.panel.reveal(vscode.ViewColumn.One);

    if (options.hideNativeChrome) {
      await this.layout.hide();
    }
    return { success: true, requiresReload: false, message: 'فُتِح سطح RTL.' };
  }

  async disable(): Promise<RtlResult> {
    this.panel?.dispose();
    this.panel = undefined;
    await this.layout.restore();
    return { success: true, requiresReload: false, message: 'أُغلِق سطح RTL.' };
  }

  async isEnabled(): Promise<boolean> {
    return this.panel !== undefined;
  }

  dispose(): void {
    this.panel?.dispose();
    this.panel = undefined;
  }
}
