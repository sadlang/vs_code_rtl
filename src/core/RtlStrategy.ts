/**
 * نقطة التوسّع الأساسية في الإضافة.
 *
 * كل طريقة لتطبيق RTL على VS Code (حقن CSS، تعديل إعدادات، webview ...إلخ)
 * تُنفَّذ كاستراتيجية مستقلّة تحقّق هذه الواجهة، ثم تُسجَّل في
 * {@link StrategyRegistry}. لإضافة طريقة جديدة: أنشئ صنفًا يحقّق
 * `RtlStrategy` وسجّله — دون تعديل بقيّة الإضافة.
 */
export interface RtlStrategy {
  /** معرّف فريد ثابت يُطابق قيمة الإعداد `vsCodeRtl.strategy`. */
  readonly id: string;

  /** اسم وصفيّ يُعرض للمستخدم. */
  readonly displayName: string;

  /**
   * هل يبقى أثر الاستراتيجية بعد إعادة تحميل النافذة؟
   * - `true` لاستراتيجيات تكتب على القرص (cssInjection).
   * - `false` لاستراتيجيات وقت التشغيل (webview) — تُعاد فتحها عند الإقلاع.
   */
  readonly survivesReload: boolean;

  /**
   * تفعيل RTL وفق الخيارات المعطاة.
   * @returns نتيجة العملية مع رسالة اختيارية للمستخدم.
   */
  enable(options: RtlOptions): Promise<RtlResult>;

  /** تعطيل RTL وإرجاع الواجهة إلى حالتها الأصلية. */
  disable(): Promise<RtlResult>;

  /** هل وضع RTL مفعَّل حاليًا عبر هذه الاستراتيجية؟ */
  isEnabled(): Promise<boolean>;
}

/** خيارات تطبيق RTL المشتقّة من إعدادات المستخدم. */
export interface RtlOptions {
  /** نطاق التطبيق: واجهة العمل فقط أم كامل الواجهة. */
  readonly scope: 'workbench' | 'all';
  /** إبقاء منطقة المحرّر باتجاه LTR. */
  readonly keepEditorLtr: boolean;
  /** إخفاء الهيكل الأصليّ (شريط الأنشطة/الحالة) لإفساح المجال لسطح RTL (webview فقط). */
  readonly hideNativeChrome?: boolean;
}

/** نتيجة عمليّة على استراتيجية. */
export interface RtlResult {
  readonly success: boolean;
  /** هل تتطلّب العمليّة إعادة تحميل النافذة لإتمامها؟ */
  readonly requiresReload: boolean;
  /** رسالة للمستخدم (نجاح أو سبب الفشل). */
  readonly message: string;
}
