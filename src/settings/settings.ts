import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { replaceDateInString, stringToMap, mapToString } from '@utils/utils';
import GameSearchPlugin, { Nullable } from '../main';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';
import { FileSuggest } from './suggesters/FileSuggester';

const docUrl = 'https://github.com/CMorooney/obsidian-game-search-plugin';

export interface GameSearchPluginSettings {
  folder: string; // new file location
  fileNameFormat: string; // new file name format
  templateFile: string;
  rawgApiKey: string;
  steamApiKey: Nullable<string>;
  steamUserId: Nullable<string>;
  syncSteamOnStart: boolean;
  syncSteamPlaytimeOnStart: boolean;
  tryFindSteamGameOnCreate: boolean;
  metaDataForOwnedSteamGames: Nullable<string>;
  metaDataForWishlistedSteamGames: Nullable<string>;
}

export const DEFAULT_SETTINGS: GameSearchPluginSettings = {
  folder: '',
  fileNameFormat: '',
  templateFile: '',
  rawgApiKey: '',
  steamApiKey: null,
  steamUserId: null,
  syncSteamOnStart: false,
  syncSteamPlaytimeOnStart: false,
  tryFindSteamGameOnCreate: false,
  metaDataForOwnedSteamGames: null,
  metaDataForWishlistedSteamGames: null,
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

    // RAWG Api Key
    new Setting(containerEl).setName('RAWG Api Key').addTextArea(textArea => {
      const prevValue = this.plugin.settings.rawgApiKey;
      textArea.setValue(prevValue).onChange(async value => {
        const newValue = value;
        this.plugin.settings.rawgApiKey = newValue;
        await this.plugin.saveSettings();
      });
    });
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

    createHeader(containerEl, 'Steam Settings');

    // Steam Api Key
    new Setting(containerEl).setName('Steam Api Key').addTextArea(textArea => {
      const prevValue = this.plugin.settings.steamApiKey;
      textArea.setValue(prevValue).onChange(async value => {
        const newValue = value;
        this.plugin.settings.steamApiKey = newValue;
        await this.plugin.saveSettings();
      });
    });

    // Steam user id
    new Setting(containerEl).setName('Steam Id').addTextArea(textArea => {
      const prevValue = this.plugin.settings.steamUserId;
      textArea.setValue(prevValue).onChange(async value => {
        const newValue = value;
        this.plugin.settings.steamUserId = newValue;
        await this.plugin.saveSettings();
      });
    });

    // Owned steam game extra metadata
    const metadataForOwnedSteamGamesDescription = document.createDocumentFragment();
    metadataForOwnedSteamGamesDescription.createDiv({ text: 'automatically add metadata to games you own on steam' });
    metadataForOwnedSteamGamesDescription.createDiv({
      text: 'enter each metadata key/value on a single line separated by a single colon, e.g.',
    });
    metadataForOwnedSteamGamesDescription.createDiv({ text: 'owned:true' });
    metadataForOwnedSteamGamesDescription.createDiv({ text: 'owned_platform:steam' });
    new Setting(containerEl)
      .setName('metadata for owned Steam games')
      .setDesc(metadataForOwnedSteamGamesDescription)
      .addTextArea(textArea => {
        const prevValue = this.plugin.settings.metaDataForOwnedSteamGames;
        textArea.setValue(prevValue).onChange(async value => {
          try {
            const newValue = stringToMap(value);
            if (newValue.size > 0) {
              this.plugin.settings.metaDataForOwnedSteamGames = mapToString(newValue);
              await this.plugin.saveSettings();
            }
          } catch (error) {
            console.warn(error);
          }
        });
      });

    // wishlisted steam game extra metadata
    const metadataForWishlistedSteamGamesDescription = document.createDocumentFragment();
    metadataForWishlistedSteamGamesDescription.createDiv({
      text: 'automatically add metadata to games you wishlist on steam',
    });
    metadataForWishlistedSteamGamesDescription.createDiv({
      text: 'enter each metadata key/value on a single line separated by a single colon, e.g.',
    });
    metadataForWishlistedSteamGamesDescription.createDiv({ text: 'owned:false' });
    metadataForWishlistedSteamGamesDescription.createDiv({ text: 'status:backlog' });
    new Setting(containerEl)
      .setName('metadata for wishlisted Steam games')
      .setDesc(metadataForWishlistedSteamGamesDescription)
      .addTextArea(textArea => {
        const prevValue = this.plugin.settings.metaDataForWishlistedSteamGames;
        textArea.setValue(prevValue).onChange(async value => {
          try {
            const newValue = stringToMap(value);
            if (newValue.size > 0) {
              this.plugin.settings.metaDataForWishlistedSteamGames = mapToString(newValue);
              await this.plugin.saveSettings();
            }
          } catch (error) {
            console.warn(error);
            new Notice('unable to parse metadata for wishlisted steam games');
          }
        });
      });

    // Steam sync on start
    const syncOnStartDescription = document.createDocumentFragment();
    syncOnStartDescription.createDiv({ text: 'performs steam sync when the plugin loads' });
    new Setting(containerEl)
      .setName('Sync on start')
      .setDesc(syncOnStartDescription)
      .addToggle(toggle => {
        const prevValue = this.plugin.settings.syncSteamOnStart;
        toggle.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.syncSteamOnStart = newValue;
          await this.plugin.saveSettings();
        });
      });

    // Steam playtime sync on start
    const syncPlaytimeOnStartDescription = document.createDocumentFragment();
    syncPlaytimeOnStartDescription.createDiv({
      text: 'update steam_playtime_forever and steam_playtime_2weeks for any notes with steam_id on plugin load',
    });
    new Setting(containerEl)
      .setName('Sync playtime on start')
      .setDesc(syncPlaytimeOnStartDescription)
      .addToggle(toggle => {
        const prevValue = this.plugin.settings.syncSteamPlaytimeOnStart;
        toggle.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.syncSteamPlaytimeOnStart = newValue;
          await this.plugin.saveSettings();
        });
      });

    // Steam playtime sync on start
    const findSteamGameOnCreateDescription = document.createDocumentFragment();
    findSteamGameOnCreateDescription.createDiv({
      text: 'when creating a game note, attempt to match with a game in your steam library (only works for owned games)',
    });
    new Setting(containerEl)
      .setName('Try match Steam game on game note creation')
      .setDesc(findSteamGameOnCreateDescription)
      .addToggle(toggle => {
        const prevValue = this.plugin.settings.tryFindSteamGameOnCreate;
        toggle.setValue(prevValue).onChange(async value => {
          const newValue = value;
          this.plugin.settings.tryFindSteamGameOnCreate = newValue;
          await this.plugin.saveSettings();
        });
      });
    createHeader(containerEl, 'Advanced/Dangerous');

    // Regenerate files
    const regenDesc = document.createDocumentFragment();
    regenDesc.createDiv({
      text: 'WARNING',
    });
    regenDesc.createDiv({
      text: 'WARNING',
    });
    regenDesc.createDiv({
      text: 'WARNING',
    });
    regenDesc.createDiv({
      text: 'WARNING',
    });
    regenDesc.createDiv({
      text: 'Clicking this button will force regenerate ALL METADATA in ALL files in your selected folder using your latest template file. No other content will be replaced in order to try and preserve any keepsake notes',
    });
    regenDesc.createDiv({
      text: 'This will work by checking metadata in the current files for either an `id/Id`, `slug/Slug`, or `name/Name` fields to query the API. As a very last fallback it will try using the filename as a query but any files that can not be requeried in all in any of these manners will be skipped for regeneration and *not* deleted',
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
