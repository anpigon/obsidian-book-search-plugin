import { ButtonComponent, Modal, Setting, TextComponent, Notice } from 'obsidian';
import { Book } from '@models/book.model';
import { BaseBooksApiImpl, factoryServiceProvider } from '@apis/base_api';
import BookSearchPlugin from '@src/main';
import { BookSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import { ServiceProvider } from '@src/constants';
import languages from '@utils/languages';

export class BookSearchModal extends Modal {
  private settings: BookSearchPluginSettings;
  private isBusy = false;
  private okBtnRef?: ButtonComponent;
  private serviceProvider: BaseBooksApiImpl;
  private readonly SEARCH_BUTTON_TEXT = 'Search';
  private readonly REQUESTING_BUTTON_TEXT = 'Requesting...';
  private options: { locale: string };

  constructor(
    plugin: BookSearchPlugin,
    private query: string,
    private callback: (error: Error | null, result?: Book[]) => void,
  ) {
    super(plugin.app);
    this.settings = plugin.settings;
    const defaultLocale = window.moment.locale();
    const localeValue = this.settings.localePreference;
    this.options = {
      locale: localeValue === DEFAULT_SETTINGS.localePreference ? defaultLocale : localeValue,
    };
    this.serviceProvider = factoryServiceProvider(plugin.settings);
  }

  setBusy(busy: boolean): void {
    this.isBusy = busy;
    this.okBtnRef?.setDisabled(busy);
    this.okBtnRef?.setButtonText(busy ? this.REQUESTING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
  }

  async searchBook(): Promise<void> {
    if (!this.query) {
      new Notice('No query entered.');
      return;
    }
    if (this.isBusy) return;

    try {
      this.setBusy(true);
      const searchResults = await this.serviceProvider.getByQuery(this.query, this.options);
      this.processSearchResults(searchResults);
    } catch (err) {
      this.callback(err as Error);
    } finally {
      this.setBusy(false);
      this.close();
    }
  }

  private processSearchResults(searchResults?: Book[]): void {
    if (!searchResults?.length) {
      new Notice(`No results found for "${this.query}"`);
      return;
    }

    this.callback(null, searchResults);
  }

  submitEnterCallback(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.isComposing) {
      this.searchBook();
    }
  }

  onOpen(): void {
    this.renderHeader();
    this.renderSelectLocale();
    this.renderSearchInput();
    this.renderSearchButton();
  }

  renderSelectLocale() {
    if (this.settings.serviceProvider !== ServiceProvider.google) return;

    const defaultLocale = window.moment.locale();
    const locales = window.moment.locales().filter(locale => locale !== defaultLocale);
    new Setting(this.contentEl).setName('Locale').addDropdown(dropdown => {
      dropdown.addOption(defaultLocale, `${languages[defaultLocale] || defaultLocale}`);
      locales.forEach(locale => {
        const localeName = languages[locale];
        if (localeName) dropdown.addOption(locale, localeName);
      });
      const localeValue = this.settings.localePreference;
      dropdown.setValue(localeValue === DEFAULT_SETTINGS.localePreference ? defaultLocale : localeValue);
      dropdown.onChange(locale => (this.options.locale = locale));
    });
  }

  private renderHeader(): void {
    this.contentEl.createEl('h2', { text: 'Search Book' });
  }

  private renderSearchInput(): void {
    this.contentEl.createDiv({ cls: 'book-search-plugin__search-modal--input' }, settingItem => {
      new TextComponent(settingItem)
        .setValue(this.query)
        .setPlaceholder('Search by keyword or ISBN')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    });
  }

  private renderSearchButton(): void {
    new Setting(this.contentEl).addButton(btn => {
      this.okBtnRef = btn
        .setButtonText(this.SEARCH_BUTTON_TEXT)
        .setCta()
        .onClick(() => this.searchBook());
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
