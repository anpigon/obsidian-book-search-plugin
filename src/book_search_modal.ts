import { App, ButtonComponent, Modal, Setting, TextComponent } from 'obsidian';
import { getByQuery } from './apis/google_books_api';
import { Book } from './models/book.model';

export class BookSearchModal extends Modal {
  query: string;
  isBusy: boolean;
  okBtnRef: ButtonComponent;
  onSubmit: (err: Error, result?: Book[]) => void;

  constructor(app: App, onSubmit?: (err: Error, result?: Book[]) => void) {
    super(app);
    this.onSubmit = onSubmit;
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
        const searchResults = await getByQuery(this.query);

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
    const { contentEl } = this;
    contentEl.empty();
  }
}
