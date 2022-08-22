import { ButtonComponent, Modal, Setting, TextComponent, Notice } from 'obsidian';
import { Book } from '@models/book.model';
import { BaseBooksApiImpl, factoryServiceProvider } from '@apis/base_api';
import BookSearchPlugin from '@src/main';

export class BookSearchModal extends Modal {
  private query: string;
  private isBusy: boolean;
  private okBtnRef: ButtonComponent;
  private callback: (err: Error, result?: Book[]) => void;
  private serviceProvider: BaseBooksApiImpl;

  constructor(plugin: BookSearchPlugin, query: string, callback?: (err: Error, result?: Book[]) => void) {
    super(plugin.app);
    this.query = query;
    this.callback = callback;
    this.serviceProvider = factoryServiceProvider(plugin.settings);
  }

  setBusy(busy: boolean) {
    this.isBusy = busy;
    this.okBtnRef.setDisabled(busy);
    this.okBtnRef.setButtonText(busy ? 'Requesting...' : 'Search');
  }

  async searchBook() {
    if (!this.query) {
      throw new Error('No query entered.');
    }

    if (!this.isBusy) {
      try {
        this.setBusy(true);
        const searchResults = await this.serviceProvider.getByQuery(this.query);
        this.setBusy(false);

        if (!searchResults?.length) {
          new Notice(`No results found for "${this.query}"`); // Couldn't find the book.
          return;
        }

        this.callback(null, searchResults);
      } catch (err) {
        this.callback(err);
      }
      this.close();
    }
  }

  submitEnterCallback(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchBook();
    }
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Search Book' });

    contentEl.createDiv({ cls: 'book-search-plugin__search-modal--input' }, settingItem => {
      new TextComponent(settingItem)
        .setValue(this.query)
        .setPlaceholder('Search by keyword or ISBN')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    });

    new Setting(contentEl).addButton(btn => {
      return (this.okBtnRef = btn
        .setButtonText('Search')
        .setCta()
        .onClick(() => {
          this.searchBook();
        }));
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
