import * as vscode from 'vscode';
import { RtlOptions } from '../core/RtlStrategy';

const SECTION = 'vsCodeRtl';

/** قارئ إعدادات الإضافة من إعدادات VS Code. */
export class Settings {
  private get config(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(SECTION);
  }

  get strategyId(): string {
    return this.config.get<string>('strategy', 'cssInjection');
  }

  get options(): RtlOptions {
    return {
      scope: this.config.get<'workbench' | 'all'>('scope', 'workbench'),
      keepEditorLtr: this.config.get<boolean>('keepEditorLtr', true),
    };
  }
}
