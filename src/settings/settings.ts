import { App, PluginSettingTab, Setting } from 'obsidian';

import BookSearchPlugin from '../main';
import { FolderSuggest } from './suggesters/FolderSuggester';

export enum DefaultFrontmatterKeyType {
  snakeCase = 'Snake Case',
  camelCase = 'Camel Case',
}

export interface BookSearchPluginSettings {
  folder: string;
  frontmatter: string;
  content: string;
  useDefaultFrontmatter: boolean;
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
  frontmatter: '',
  content: '',
  useDefaultFrontmatter: true,
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType.snakeCase,
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

    containerEl.createEl('h3', { text: 'General Settings' });

    new Setting(containerEl)
      .setName('New file location')
      .setDesc('New book notes will be placed here.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Example: folder1/folder2')
          .setValue(this.plugin.settings.folder)
          .onChange(new_folder => {
            this.plugin.settings.folder = new_folder;
            this.plugin.saveSettings();
          });
      });

    containerEl.createEl('h3', { text: 'Frontmatter Settings' });

    new Setting(containerEl)
      .setName('Use the default frontmatter')
      .setDesc("If you don't want the default frontmatter to be inserted, disable it.")
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.useDefaultFrontmatter).onChange(async value => {
          const newValue = value;
          this.plugin.settings.useDefaultFrontmatter = newValue;
          await this.plugin.saveSettings();
        });
      });

    const descForKeyType = document.createDocumentFragment();
    descForKeyType.append(
      '- Snake Case: ',
      descForKeyType.createEl('code', { text: 'total_page' }),
      descForKeyType.createEl('br'),
      '- Camel Case: ',
      descForKeyType.createEl('code', { text: 'totalPage' }),
    );
    new Setting(containerEl)
      .setName('Default frontmatter key type')
      .setDesc(descForKeyType)
      .addDropdown(dropDown => {
        dropDown.addOption(DefaultFrontmatterKeyType.snakeCase, DefaultFrontmatterKeyType.snakeCase.toString());
        dropDown.addOption(DefaultFrontmatterKeyType.camelCase, DefaultFrontmatterKeyType.camelCase.toString());
        dropDown.setValue(this.plugin.settings.defaultFrontmatterKeyType);
        dropDown.onChange(async value => {
          this.plugin.settings.defaultFrontmatterKeyType = value as DefaultFrontmatterKeyType;
          await this.plugin.saveSettings();
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

    containerEl.createEl('h3', { text: 'Content Settings' });

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
