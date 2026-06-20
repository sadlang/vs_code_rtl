import * as fs from 'fs/promises';
import { RtlOptions, RtlResult, RtlStrategy } from '../core/RtlStrategy';
import { generateRtlCss, hasRtlCss, stripRtlCss } from './rtlCss';

/** مُزوّد مسار ملفّ CSS المستهدَف — يُحقَن للسماح بالاختبار. */
export type TargetProvider = () => string | undefined;

/**
 * استراتيجية تطبّق RTL بحقن كتلة CSS في ملفّ واجهة العمل الخاص بتثبيت
 * VS Code. تتطلّب صلاحيّة الكتابة على مجلّد التثبيت، وإعادة تحميل النافذة.
 *
 * ملاحظة: تحديث VS Code قد يُعيد كتابة الملفّ ويُلغي الحقن — عندها يُعاد
 * التطبيق عبر الأمر `vsCodeRtl.reapply`.
 */
export class CssInjectionStrategy implements RtlStrategy {
  readonly id = 'cssInjection';
  readonly displayName = 'حقن CSS في واجهة العمل';

  constructor(private readonly targetProvider: TargetProvider) {}

  async enable(options: RtlOptions): Promise<RtlResult> {
    const target = this.targetProvider();
    if (!target) {
      return this.notFound();
    }
    try {
      const original = await fs.readFile(target, 'utf8');
      const cleaned = stripRtlCss(original);
      const block = generateRtlCss(options);
      await fs.writeFile(target, `${cleaned.trimEnd()}\n${block}\n`, 'utf8');
      return {
        success: true,
        requiresReload: true,
        message: 'فُعّل وضع RTL. أعد تحميل النافذة لتطبيق التغييرات.',
      };
    } catch (err) {
      return this.writeError(err);
    }
  }

  async disable(): Promise<RtlResult> {
    const target = this.targetProvider();
    if (!target) {
      return this.notFound();
    }
    try {
      const original = await fs.readFile(target, 'utf8');
      if (!hasRtlCss(original)) {
        return { success: true, requiresReload: false, message: 'وضع RTL غير مفعَّل أصلًا.' };
      }
      await fs.writeFile(target, `${stripRtlCss(original).trimEnd()}\n`, 'utf8');
      return {
        success: true,
        requiresReload: true,
        message: 'عُطّل وضع RTL. أعد تحميل النافذة لتطبيق التغييرات.',
      };
    } catch (err) {
      return this.writeError(err);
    }
  }

  async isEnabled(): Promise<boolean> {
    const target = this.targetProvider();
    if (!target) {
      return false;
    }
    try {
      const content = await fs.readFile(target, 'utf8');
      return hasRtlCss(content);
    } catch {
      return false;
    }
  }

  private notFound(): RtlResult {
    return {
      success: false,
      requiresReload: false,
      message: 'تعذّر العثور على ملفّ واجهة VS Code. قد يكون الإصدار غير مدعوم.',
    };
  }

  private writeError(err: unknown): RtlResult {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      requiresReload: false,
      message:
        `فشلت الكتابة على ملفّ الواجهة (${reason}). ` +
        'قد تحتاج إلى تشغيل VS Code بصلاحيّات إداريّة.',
    };
  }
}
