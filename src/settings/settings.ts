import { App, PluginSettingTab, Setting } from 'obsidian';

import BookSearchPlugin from '../main';
import { FolderSuggest } from './suggesters/FolderSuggester';

export interface BookSearchPluginSettings {
  folder: string;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
};

export class BookSearchSettingTab extends PluginSettingTab {
  plugin: BookSearchPlugin;

  constructor(app: App, plugin: BookSearchPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Book Search Settings' });

    new Setting(containerEl)
      .setName('New file location')
      .setDesc('New book notes will be placed here.')
      .addSearch(cb => {
        new FolderSuggest(this.app, cb.inputEl);
        cb.setPlaceholder('Example: folder1/folder2')
          .setValue(this.plugin.settings.folder)
          .onChange(new_folder => {
            this.plugin.settings.folder = new_folder;
            this.plugin.saveSettings();
          });
      });
  }
}
