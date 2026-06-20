import { RtlStrategy } from './RtlStrategy';

/**
 * سجلّ الاستراتيجيات المتاحة. يتيح تسجيل استراتيجيات جديدة واسترجاعها
 * بالمعرّف، وهو جوهر قابليّة التوسّع: لا تعرف بقيّة الإضافة بأيّ
 * استراتيجية محدّدة، بل تتعامل مع الواجهة عبر هذا السجلّ.
 */
export class StrategyRegistry {
  private readonly strategies = new Map<string, RtlStrategy>();

  /** تسجيل استراتيجية. يرمي خطأً عند تكرار المعرّف. */
  register(strategy: RtlStrategy): void {
    if (this.strategies.has(strategy.id)) {
      throw new Error(`استراتيجية مسجّلة مسبقًا بالمعرّف: ${strategy.id}`);
    }
    this.strategies.set(strategy.id, strategy);
  }

  /** استرجاع استراتيجية بالمعرّف، أو undefined إن لم توجد. */
  get(id: string): RtlStrategy | undefined {
    return this.strategies.get(id);
  }

  /** هل يوجد تسجيل بهذا المعرّف؟ */
  has(id: string): boolean {
    return this.strategies.has(id);
  }

  /** قائمة معرّفات الاستراتيجيات المسجّلة. */
  ids(): string[] {
    return [...this.strategies.keys()];
  }

  /** كل الاستراتيجيات المسجّلة. */
  all(): RtlStrategy[] {
    return [...this.strategies.values()];
  }
}
