import { App, Modal, Setting } from 'obsidian';

export class ConfirmRegenModal extends Modal {
  onSubmit: () => void;

  constructor(app: App, onSubmit: () => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.setText('Please confirm you want to completely destroy and recreate your game notes folder');

    new Setting(contentEl).addButton(btn =>
      btn
        .setButtonText('Submit')
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit();
        }),
    );
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
