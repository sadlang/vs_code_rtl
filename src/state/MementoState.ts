import * as vscode from 'vscode';
import { RtlState } from '../core/RtlState';

const KEY = 'vsCodeRtl.enabled';

/** تنفيذ {@link RtlState} فوق ذاكرة VS Code العامّة (globalState). */
export class MementoState implements RtlState {
  constructor(private readonly memento: vscode.Memento) {}

  isEnabled(): boolean {
    return this.memento.get<boolean>(KEY, false);
  }

  async setEnabled(value: boolean): Promise<void> {
    await this.memento.update(KEY, value);
  }
}
