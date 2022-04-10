import { App, PluginSettingTab, Setting } from 'obsidian';

import BookSearchPlugin from '../main';
import { FolderSuggest } from './suggesters/FolderSuggester';

export interface BookSearchPluginSettings {
  folder: string;
  frontmatter: string;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
  frontmatter: '',
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

    new Setting(containerEl)
      .setName('Insert frontmatter')
      .setDesc('Text to insert into the YAML frontmatter')
      .addTextArea(textArea => {
        const prevValue = this.plugin.settings.frontmatter;
        textArea.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.frontmatter = newValue;
          await this.plugin.saveSettings();
        });
      });
  }
}
