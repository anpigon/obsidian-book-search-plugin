import { App, PluginSettingTab, Setting } from 'obsidian';
import { replaceDateInString } from '@utils/utils';

import GameSearchPlugin from '../main';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';
import { FileSuggest } from './suggesters/FileSuggester';

const docUrl = 'https://github.com/CMorooney/obsidian-game-search-plugin';

export interface GameSearchPluginSettings {
  folder: string; // new file location
  fileNameFormat: string; // new file name format
  templateFile: string;
  rawgApiKey: string;
}

export const DEFAULT_SETTINGS: GameSearchPluginSettings = {
  folder: '',
  fileNameFormat: '',
  templateFile: '',
  rawgApiKey: '',
};

export class GameSearchSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: GameSearchPlugin) {
    super(app, plugin);
  }

  get settings() {
    return this.plugin.settings;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.classList.add('game-search-plugin__settings');

    createHeader(containerEl, 'General Settings');

    new Setting(containerEl).setName('RAWG Api Key').addTextArea(textArea => {
      const prevValue = this.plugin.settings.rawgApiKey;
      textArea.setValue(prevValue).onChange(async value => {
        const newValue = value;
        this.plugin.settings.rawgApiKey = newValue;
        await this.plugin.saveSettings();
      });
    }),
      // New file location
      new Setting(containerEl)
        .setName('New file location')
        .setDesc('New game notes will be placed here.')
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
    let newFileNameHint = replaceDateInString(this.plugin.settings.fileNameFormat) || '{{name}} - {{release}}';
    new Setting(containerEl)
      .setClass('game-search-plugin__settings--new_file_name')
      .setName('New file name')
      .setDesc('Enter the file name format.')
      .addSearch(cb => {
        try {
          new FileNameFormatSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Example: {{name}} - {{release}}')
          .setValue(this.plugin.settings.fileNameFormat)
          .onChange(newValue => {
            this.plugin.settings.fileNameFormat = newValue?.trim();
            this.plugin.saveSettings();

            newFileNameHint = replaceDateInString(newValue) || '{{name}} - {{release}}';
          });
      });

    const newFileNameHintElement = document.createDocumentFragment().createEl('code', {
      text: newFileNameHint,
    });

    containerEl
      .createEl('div', {
        cls: ['setting-item-description', 'game-search-plugin__settings--new_file_name_hint'],
      })
      .append(newFileNameHintElement);

    // Template file
    const templateFileDesc = document.createDocumentFragment();
    templateFileDesc.createDiv({ text: 'Files will be available as templates.' });
    templateFileDesc.createEl('a', {
      text: 'Example Template',
      href: `${docUrl}#example-template`,
    });
    new Setting(containerEl)
      .setName('Template file')
      .setDesc(templateFileDesc)
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

    // Regenerate files
    const regenDesc = document.createDocumentFragment();
    regenDesc.createDiv({
      text: 'WARNING: this will attempt to regenerate all the game files in your selected directory and may have unintended effects.',
    });
    regenDesc.createDiv({
      text: 'It will do so by checking metadata in the current files for either an `id`, `slug`, or `name` field to query the API. Any files without this metadata will be skipped.',
    });
    regenDesc.createDiv({
      text: 'This function will only attempt to update/replace/regenerate the metadata of the document and leave other content untouched.',
    });

    new Setting(containerEl)
      .setName('Regenerate files')
      .setDesc(regenDesc)
      .addButton(bc => {
        bc.setButtonText('Regen');
        bc.onClick(() => {
          this.plugin.regenerateAllGameNotesMetadata();
        });
      });
  }
}

function createHeader(containerEl: HTMLElement, title: string) {
  const titleEl = document.createDocumentFragment();
  titleEl.createEl('h2', { text: title });
  return new Setting(containerEl).setHeading().setName(titleEl);
}
