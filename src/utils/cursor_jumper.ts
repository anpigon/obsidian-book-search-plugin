import { App, MarkdownView } from 'obsidian';

export class CursorJumper {
  constructor(private app: App) {}

  async jumpToNextCursorLocation(): Promise<void> {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const file = activeView?.file;
    if (!file) {
      return;
    }
    const content = await this.app.vault.cachedRead(file);
    const indexOffset = content.length + 1;
    const editor = activeView.editor;
    editor.focus();
    editor.setCursor(indexOffset, 0);
  }
}
