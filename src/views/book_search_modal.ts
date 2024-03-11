import { ButtonComponent, Modal, Setting, TextComponent, Notice } from 'obsidian';
import { Book } from '@models/book.model';
import { BaseBooksApiImpl, factoryServiceProvider } from '@apis/base_api';
import BookSearchPlugin from '@src/main';
import { BookSearchPluginSettings } from '@settings/settings';
import { ServiceProvider } from '@src/constants';

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
    this.options = {
      locale: this.settings.localePreference || 'default',
    };
    this.serviceProvider = factoryServiceProvider(plugin.settings);
  }

  setBusy(busy: boolean): void {
    this.isBusy = busy;
    this.okBtnRef?.setDisabled(busy);
    this.okBtnRef?.setButtonText(busy ? this.REQUESTING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
  }

  async searchBook(): Promise<void> {
    if (!this.query) throw new Error('No query entered.');
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
    if (this.settings.serviceProvider === ServiceProvider.google) {
      this.renderSelectLocale();
    }
    this.renderSearchInput();
    this.renderSearchButton();
  }

  renderSelectLocale() {
    const locales = window.moment.locales();
    const defaultLocale = window.moment.locale();
    const localeValue = this.settings.localePreference || 'default';
    new Setting(this.contentEl).setName('Locale').addDropdown(dropdown => {
      locales.forEach(locale => dropdown.addOption(locale, locale));
      dropdown.setValue(localeValue === 'default' ? defaultLocale : localeValue);
      dropdown.setValue(this.settings.localePreference);
      dropdown.onChange(async locale => {
        this.options = {
          locale,
        };
      });
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
