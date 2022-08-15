import { App, Modal, Setting, TextComponent } from 'obsidian';

export class SettingServiceProviderModal extends Modal {
  private query: string;

  constructor(app: App, private callback: (result: string[]) => void) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Search Book' });

    const placeholder = 'Search by keyword or ISBN';
    const textComponent = new TextComponent(contentEl);
    textComponent.setValue(this.query);
    textComponent.inputEl.style.width = '100%';
    textComponent.setPlaceholder(placeholder ?? '').onChange(value => (this.query = value));
    // .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    contentEl.appendChild(textComponent.inputEl);
    textComponent.inputEl.focus();

    new Setting(contentEl)
      .addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
      .addButton(btn => {
        return btn
          .setButtonText('Ok')
          .setCta()
          .onClick(() => {
            this.callback(['']);
          });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
