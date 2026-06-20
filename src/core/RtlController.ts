import { Settings } from '../config/Settings';
import { RtlResult } from './RtlStrategy';
import { StrategyRegistry } from './StrategyRegistry';

/**
 * المنسّق: يربط الإعدادات بالسجلّ، ويختار الاستراتيجية الحاليّة
 * وينفّذ العمليات عليها. لا يعرف بأيّ استراتيجية محدّدة.
 */
export class RtlController {
  constructor(
    private readonly registry: StrategyRegistry,
    private readonly settings: Settings,
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
    return this.resolveStrategy().enable(this.settings.options);
  }

  async disable(): Promise<RtlResult> {
    return this.resolveStrategy().disable();
  }

  async isEnabled(): Promise<boolean> {
    return this.resolveStrategy().isEnabled();
  }

  async toggle(): Promise<RtlResult> {
    return (await this.isEnabled()) ? this.disable() : this.enable();
  }
}
