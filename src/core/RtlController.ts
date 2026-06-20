import { Settings } from '../config/Settings';
import { RtlResult } from './RtlStrategy';
import { DriftStatus, RtlState } from './RtlState';
import { StrategyRegistry } from './StrategyRegistry';

/**
 * المنسّق: يربط الإعدادات بالسجلّ والحالة، ويختار الاستراتيجية الحاليّة
 * وينفّذ العمليات عليها. لا يعرف بأيّ استراتيجية محدّدة.
 */
export class RtlController {
  constructor(
    private readonly registry: StrategyRegistry,
    private readonly settings: Settings,
    private readonly state: RtlState,
  ) {}

  private resolveStrategy() {
    const id = this.settings.strategyId;
    const strategy = this.registry.get(id);
    if (!strategy) {
      throw new Error(`استراتيجية غير معروفة: ${id}`);
    }
    return strategy;
  }

  async enable(): Promise<RtlResult> {
    const result = await this.resolveStrategy().enable(this.settings.options);
    if (result.success) {
      await this.state.setEnabled(true);
    }
    return result;
  }

  async disable(): Promise<RtlResult> {
    const result = await this.resolveStrategy().disable();
    if (result.success) {
      await this.state.setEnabled(false);
    }
    return result;
  }

  /** هل RTL مطبَّق فعليًّا على القرص الآن؟ */
  async isEnabled(): Promise<boolean> {
    return this.resolveStrategy().isEnabled();
  }

  async toggle(): Promise<RtlResult> {
    return (await this.isEnabled()) ? this.disable() : this.enable();
  }

  /**
   * يقارن نيّة المستخدم المسجّلة بالحالة الفعليّة على القرص.
   * يُستخدم عند الإقلاع لاكتشاف محو التحديث للحقن.
   */
  async checkDrift(): Promise<DriftStatus> {
    const intended = this.state.isEnabled();
    const actual = await this.isEnabled();
    if (intended && !actual) {
      return 'drift';
    }
    if (!intended && actual) {
      return 'stale';
    }
    return 'ok';
  }
}
