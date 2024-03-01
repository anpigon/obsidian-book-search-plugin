import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { replaceDateInString } from '@utils/utils';

import BookSearchPlugin from '../main';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';
import { FileSuggest } from './suggesters/FileSuggester';
import { ServiceProvider } from '@src/constants';
import { SettingServiceProviderModal } from '@views/setting_service_provider_modal';

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
  serviceProvider: ServiceProvider;
  naverClientId: string;
  naverClientSecret: string;
  localePreference: string;
  apiKey: string;
  openPageOnCompletion: boolean;
  showCoverImageInSearch: boolean;
  enableCoverImageSave: boolean;
  coverImagePath: string;
}

export const DEFAULT_SETTINGS: BookSearchPluginSettings = {
  folder: '',
  fileNameFormat: '',
  frontmatter: '',
  content: '',
  useDefaultFrontmatter: true,
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType.camelCase,
  templateFile: '',
  serviceProvider: ServiceProvider.google,
  naverClientId: '',
  naverClientSecret: '',
  localePreference: 'default',
  apiKey: '',
  openPageOnCompletion: true,
  showCoverImageInSearch: false,
  enableCoverImageSave: false,
  coverImagePath: '',
};

export class BookSearchSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: BookSearchPlugin) {
    super(app, plugin);
  }

  get settings() {
    return this.plugin.settings;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.classList.add('book-search-plugin__settings');

    createHeader(containerEl, 'General Settings');

    // New file location
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

    // Service Provider
    let serviceProviderExtraSettingButton: HTMLElement;
    // eslint-disable-next-line prefer-const
    let preferredLocaleDropdownSetting: Setting;
    const hideServiceProviderExtraSettingButton = () => {
      serviceProviderExtraSettingButton.addClass('book-search-plugin__hide');
    };
    const showServiceProviderExtraSettingButton = () => {
      serviceProviderExtraSettingButton.removeClass('book-search-plugin__hide');
    };
    const hideServiceProviderExtraSettingDropdown = () => {
      if (preferredLocaleDropdownSetting !== undefined) {
        preferredLocaleDropdownSetting.settingEl.addClass('book-search-plugin__hide');
      }
    };
    const showServiceProviderExtraSettingDropdown = () => {
      if (preferredLocaleDropdownSetting !== undefined) {
        preferredLocaleDropdownSetting.settingEl.removeClass('book-search-plugin__hide');
      }
    };
    const toggleServiceProviderExtraSettings = (serviceProvider: ServiceProvider = this.settings?.serviceProvider) => {
      if (serviceProvider === ServiceProvider.naver) {
        showServiceProviderExtraSettingButton();
        hideServiceProviderExtraSettingDropdown();
      } else {
        hideServiceProviderExtraSettingButton();
        showServiceProviderExtraSettingDropdown();
      }
    };
    new Setting(containerEl)
      .setName('Service Provider')
      .setDesc('Choose the service provider you want to use to search your books.')
      .setClass('book-search-plugin__settings--service_provider')
      .addDropdown(dropDown => {
        dropDown.addOption(ServiceProvider.google, `${ServiceProvider.google} (Global)`);
        dropDown.addOption(ServiceProvider.naver, `${ServiceProvider.naver} (Korean)`);
        dropDown.setValue(this.plugin.settings?.serviceProvider ?? ServiceProvider.google);
        dropDown.onChange(async value => {
          const newValue = value as ServiceProvider;
          toggleServiceProviderExtraSettings(newValue);
          this.settings['serviceProvider'] = newValue;
          await this.plugin.saveSettings();
        });
      })
      .addExtraButton(component => {
        serviceProviderExtraSettingButton = component.extraSettingsEl;
        toggleServiceProviderExtraSettings();
        component.onClick(() => {
          new SettingServiceProviderModal(this.plugin).open();
        });
      });

    preferredLocaleDropdownSetting = new Setting(containerEl)
      .setName('Preferred locale')
      .setDesc('Sets the preferred locale to use when searching for books.')
      .addDropdown(dropDown => {
        const defaultLocale = window.moment.locale();
        dropDown.addOption(defaultLocale, `${defaultLocale} (Default Locale)`);
        window.moment.locales().forEach(locale => {
          dropDown.addOption(locale, locale);
        });
        const setValue = this.settings.localePreference;
        if (setValue === 'default') {
          dropDown.setValue(defaultLocale);
        } else {
          dropDown.setValue(setValue);
        }
        dropDown.onChange(async value => {
          const newValue = value;
          this.settings.localePreference = newValue;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Open New Book Note')
      .setDesc('Enable or disable the automatic opening of the note on creation.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.openPageOnCompletion).onChange(async value => {
          this.plugin.settings.openPageOnCompletion = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Show Cover Images in Search')
      .setDesc('Toggle to show or hide cover images in the search results.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.showCoverImageInSearch).onChange(async value => {
          this.plugin.settings.showCoverImageInSearch = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Enable Cover Image Save')
      .setDesc('Toggle to enable or disable saving cover images in notes.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.enableCoverImageSave).onChange(async value => {
          this.plugin.settings.enableCoverImageSave = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Cover Image Path')
      .setDesc('Specify the path where cover images should be saved.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Enter the path (e.g., Images/Covers)')
          .setValue(this.plugin.settings.coverImagePath)
          .onChange(async value => {
            this.plugin.settings.coverImagePath = value.trim();
            await this.plugin.saveSettings();
          });
      });

    // API Settings
    const APISettingsChildren: Setting[] = [];
    createFoldingHeader(containerEl, 'Google API Settings', APISettingsChildren);
    let tempKeyValue = '';
    APISettingsChildren.push(
      new Setting(containerEl)
        .setClass('book-search-plugin__hide')
        .setName('Google Book API Key')
        .setDesc(
          'Add your Books API key. **WARNING** please use this field after you must understand Google Cloud API, such as API key security.',
        )
        .addText(text => {
          text.inputEl.type = 'password';
          text.setValue(this.plugin.settings.apiKey).onChange(async value => {
            tempKeyValue = value;
          });
        })
        .addButton(button => {
          button.setButtonText('Save Key').onClick(async () => {
            this.plugin.settings.apiKey = tempKeyValue;
            await this.plugin.saveSettings();
            new Notice('Apikey Saved');
          });
        }),
    );
  }
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
