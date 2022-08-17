import { App, PluginSettingTab, Setting } from 'obsidian';
import { replaceDateInString } from '@utils/utils';

import BookSearchPlugin from '../main';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';
import { FileSuggest } from './suggesters/FileSuggester';

const docUrl = 'https://github.com/anpigon/obsidian-book-search-plugin';

export enum DefaultFrontmatterKeyType {
  snakeCase = 'Snake Case',
  camelCase = 'Camel Case',
}

export interface BookSearchPluginSettings {
  folder: string; // new file location
  fileNameFormat: string; // new file name format
  frontmatter: string; // frontmatter that is inserted into the file
  content: string; // what is automatically written to the file.
  useDefaultFrontmatter: boolean;
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType;
  templateFile: string;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
  fileNameFormat: '',
  frontmatter: '',
  content: '',
  useDefaultFrontmatter: true,
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType.camelCase,
  templateFile: '',
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

    containerEl.classList.add('book-search-plugin__settings');

    createHeader(containerEl, 'General Settings');

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

    // New File Name
    const newFileNameHint = document.createDocumentFragment().createEl('code', {
      text: replaceDateInString(this.plugin.settings.fileNameFormat) || '{{title}} - {{author}}',
    });
    new Setting(containerEl)
      .setClass('book-search-plugin__settings--new_file_name')
      .setName('New file name')
      .setDesc('Enter the file name format.')
      .addSearch(cb => {
        try {
          new FileNameFormatSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Example: {{title}} - {{author}}')
          .setValue(this.plugin.settings.fileNameFormat)
          .onChange(newValue => {
            this.plugin.settings.fileNameFormat = newValue?.trim();
            this.plugin.saveSettings();

            newFileNameHint.innerHTML = replaceDateInString(newValue) || '{{title}} - {{author}}';
          });
      });
    containerEl
      .createEl('div', {
        cls: ['setting-item-description', 'book-search-plugin__settings--new_file_name_hint'],
      })
      .append(newFileNameHint);

    new Setting(containerEl)
      .setName('Template file')
      .setDesc('Files will be available as templates.')
      .addSearch(cb => {
        try {
          new FileSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Example: templates/template-file')
          .setValue(this.plugin.settings.templateFile)
          .onChange(newTemplateFile => {
            this.plugin.settings.templateFile = newTemplateFile;
            this.plugin.saveSettings();
          });
      });

    // Frontmatter Settings
    const formatterSettingsChildren: Setting[] = [];
    createFoldingHeader(containerEl, 'Frontmatter Settings', formatterSettingsChildren);
    formatterSettingsChildren.push(
      new Setting(containerEl)
        .setClass('book-search-plugin__hide')
        .setName('Use the default frontmatter')
        .setDesc("If you don't want the default frontmatter to be inserted, disable it.")
        .addToggle(toggle => {
          toggle.setValue(this.plugin.settings.useDefaultFrontmatter).onChange(async value => {
            const newValue = value;
            this.plugin.settings.useDefaultFrontmatter = newValue;
            await this.plugin.saveSettings();
          });
        }),
      new Setting(containerEl)
        .setClass('book-search-plugin__hide')
        .setName('Default frontmatter key type')
        .setDesc(createKeyTypeDesc())
        .addDropdown(dropDown => {
          dropDown.addOption(DefaultFrontmatterKeyType.snakeCase, DefaultFrontmatterKeyType.snakeCase.toString());
          dropDown.addOption(DefaultFrontmatterKeyType.camelCase, DefaultFrontmatterKeyType.camelCase.toString());
          dropDown.setValue(this.plugin.settings.defaultFrontmatterKeyType);
          dropDown.onChange(async value => {
            this.plugin.settings.defaultFrontmatterKeyType = value as DefaultFrontmatterKeyType;
            await this.plugin.saveSettings();
          });
        }),
      new Setting(containerEl)
        .setClass('book-search-plugin__hide')
        .setName('(Deprecated) Text to insert into frontmatter')
        .setDesc(createSyntaxesDescription('#text-to-insert-into-frontmatter'))
        .addTextArea(textArea => {
          const prevValue = this.plugin.settings.frontmatter;
          textArea.setValue(prevValue).onChange(async value => {
            const newValue = value;
            this.plugin.settings.frontmatter = newValue;
            await this.plugin.saveSettings();
          });
        }),
    );

    // Content Settings
    const contentSettingsChildren: Setting[] = [];
    createFoldingHeader(containerEl, 'Content Settings', contentSettingsChildren);
    contentSettingsChildren.push(
      new Setting(containerEl)
        .setClass('book-search-plugin__hide')
        .setName('(Deprecated) Text to insert into content')
        .setDesc(createSyntaxesDescription('#text-to-insert-into-content'))
        .addTextArea(textArea => {
          const prevValue = this.plugin.settings.content;
          textArea.setValue(prevValue).onChange(async value => {
            const newValue = value;
            this.plugin.settings.content = newValue;
            await this.plugin.saveSettings();
          });
        }),
    );
  }
}

function createKeyTypeDesc() {
  const doc = document.createDocumentFragment();
  doc.append(
    '- Snake Case: ',
    doc.createEl('code', { text: 'total_page' }),
    doc.createEl('br'),
    '- Camel Case: ',
    doc.createEl('code', { text: 'totalPage' }),
  );
  return doc;
}

function createHeader(containerEl: HTMLElement, title: string) {
  const titleEl = document.createDocumentFragment();
  titleEl.createEl('h2', { text: title });
  return new Setting(containerEl).setHeading().setName(titleEl);
}

function createFoldingHeader(containerEl: HTMLElement, title: string, formatterSettingsChildren: Setting[]) {
  return createHeader(containerEl, title).addToggle(toggle => {
    toggle.onChange(checked => {
      formatterSettingsChildren.forEach(({ settingEl }) => {
        settingEl.toggleClass('book-search-plugin__show', checked);
      });
    });
  });
}

function createSyntaxesDescription(anchorLink: string) {
  const desc = document.createDocumentFragment();
  desc.append(
    'Please use the template file.',
    desc.createEl('br'),
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
      href: `${docUrl}${anchorLink}`,
      text: 'documentation',
    }),
    ' for more information.',
  );
  return desc;
}
