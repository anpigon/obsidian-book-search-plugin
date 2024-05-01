import { ServiceProvider } from '@src/constants';
import BookSearchPlugin from '@src/main';
import { Modal, Setting } from 'obsidian';

export class SettingServiceProviderModal extends Modal {
  private readonly plugin: BookSearchPlugin;
  private readonly currentServiceProvider: ServiceProvider;

  constructor(
    plugin: BookSearchPlugin,
    private callback?: () => void,
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.currentServiceProvider = plugin.settings?.serviceProvider ?? ServiceProvider.google;
  }

  get settings() {
    return this.plugin.settings;
  }

  async saveSetting() {
    return this.plugin.saveSettings();
  }

  saveClientId(clientId: string) {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      this.plugin.settings['naverClientId'] = clientId;
    }
  }

  saveClientSecret(clientSecret: string) {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      this.settings['naverClientSecret'] = clientSecret;
    }
  }

  get currentClientId() {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      return this.settings.naverClientId;
    }
    return '';
  }

  get currentClientSecret() {
    if (this.currentServiceProvider === ServiceProvider.naver) {
      return this.settings.naverClientSecret;
    }
    return '';
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Service Provider Setting' });

    new Setting(contentEl).setName('Client ID').addText(text => {
      text.setValue(this.currentClientId).onChange(value => this.saveClientId(value));
    });

    new Setting(contentEl).setName('Client Secret').addText(text => {
      text.setValue(this.currentClientSecret).onChange(value => this.saveClientSecret(value));
    });

    new Setting(contentEl).addButton(btn =>
      btn
        .setButtonText('Save')
        .setCta()
        .onClick(async () => {
          await this.plugin.saveSettings();
          this.close();
          this.callback?.();
        }),
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}
