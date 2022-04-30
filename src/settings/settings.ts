import { App, PluginSettingTab, Setting } from 'obsidian';

import BookSearchPlugin from '../main';
import { FolderSuggest } from './suggesters/FolderSuggester';

export interface BookSearchPluginSettings {
  folder: string;
  frontmatter: string;
  content: string;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
  frontmatter: '',
  content: '',
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
      .setName('Text to insert into frontmatter')
      .setDesc('Text to insert into the YAML frontmatter')
      .addTextArea(textArea => {
        const prevValue = this.plugin.settings.frontmatter;
        textArea.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.frontmatter = newValue;
          await this.plugin.saveSettings();
        });
      });

    const desc = document.createDocumentFragment();
    desc.append(
      'The following syntaxes are available: ',
      desc.createEl('br'),
      desc.createEl('code', { text: '{{title}}' }),
      ', ',
      desc.createEl('code', { text: '{{author}}' }),
      ', ',
      desc.createEl('code', { text: '{{category}}' }),
      ', ',
      desc.createEl('code', { text: '{{publisher}}' }),
      ', ',
      desc.createEl('code', { text: '{{publishDate}}' }),
      ', ',
      desc.createEl('code', { text: '{{totalPage}}' }),
      ', ',
      desc.createEl('code', { text: '{{coverUrl}}' }),
      ', ',
      desc.createEl('code', { text: '{{isbn10}}' }),
      ', ',
      desc.createEl('code', { text: '{{isbn13}}' }),
      desc.createEl('br'),
      'Check the ',
      desc.createEl('a', {
        href: 'https://github.com/anpigon/obsidian-book-search-plugin#text-to-insert-into-content',
        text: 'documentation',
      }),
      ' for more information.',
    );
    new Setting(containerEl)
      .setName('Text to insert into content')
      .setDesc(desc)
      .addTextArea(textArea => {
        const prevValue = this.plugin.settings.content;
        textArea.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.content = newValue;
          await this.plugin.saveSettings();
        });
      });
  }
}
