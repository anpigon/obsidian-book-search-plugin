import { ButtonComponent, Modal, Setting, TextComponent } from 'obsidian';
import { Book } from '@models/book.model';
import { BaseBooksApiImpl, factoryServiceProvider } from '@apis/base_api';
import BookSearchPlugin from '@src/main';

export class BookSearchModal extends Modal {
  private query: string;
  private isBusy: boolean;
  private okBtnRef: ButtonComponent;
  private onSubmit: (err: Error, result?: Book[]) => void;
  private serviceProvider: BaseBooksApiImpl;

  constructor(context: BookSearchPlugin, query: string, onSubmit?: (err: Error, result?: Book[]) => void) {
    super(context.app);
    this.query = query;
    this.onSubmit = onSubmit;
    this.serviceProvider = factoryServiceProvider(context.settings);
  }

  async searchBook() {
    if (!this.query) {
      throw new Error('No query entered.');
    }

    if (!this.isBusy) {
      try {
        this.isBusy = true;
        this.okBtnRef.setDisabled(false);
        this.okBtnRef.setButtonText('Requesting...');
        const searchResults = await this.serviceProvider.getByQuery(this.query);
        this.onSubmit(null, searchResults);
      } catch (err) {
        this.onSubmit(err);
      } finally {
        this.close();
      }
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

    const placeholder = 'Search by keyword or ISBN';
    const textComponent = new TextComponent(contentEl);
    textComponent.setValue(this.query);
    textComponent.inputEl.style.width = '100%';
    textComponent
      .setPlaceholder(placeholder ?? '')
      .onChange(value => (this.query = value))
      .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    contentEl.appendChild(textComponent.inputEl);
    textComponent.inputEl.focus();

    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn => {
        return (this.okBtnRef = btn
          .setButtonText('Ok')
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
