/** محتوى مؤشّر شريط الحالة وفق حالة RTL — دالة نقيّة قابلة للاختبار. */
export interface StatusBarContent {
  text: string;
  tooltip: string;
}

export function statusBarContent(enabled: boolean): StatusBarContent {
  return enabled
    ? {
        text: '$(arrow-left) RTL',
        tooltip: 'وضع RTL مفعَّل — انقر للتعطيل',
      }
    : {
        text: '$(arrow-right) LTR',
        tooltip: 'وضع RTL معطَّل — انقر للتفعيل',
      };
}
