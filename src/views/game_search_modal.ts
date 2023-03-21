import { ButtonComponent, Modal, Setting, TextComponent, Notice } from 'obsidian';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { Game } from '@models/game.model';
import GameSearchPlugin from '@src/main';

export class GameSearchModal extends Modal {
  private isBusy = false;
  private okBtnRef?: ButtonComponent;

  constructor(
    plugin: GameSearchPlugin,
    private key: string,
    private query: string,
    private callback: (error: Error | null, result?: Game[]) => void,
  ) {
    super(plugin.app);
  }

  setBusy(busy: boolean) {
    this.isBusy = busy;
    this.okBtnRef?.setDisabled(busy);
    this.okBtnRef?.setButtonText(busy ? 'Requesting...' : 'Search');
  }

  async searchGame() {
    if (!this.query) {
      throw new Error('No query entered.');
    }

    if (!this.isBusy) {
      try {
        this.setBusy(true);
        const api = new RAWGAPI(this.key);
        const searchResults = await api.getByQuery(this.query);
        this.setBusy(false);

        if (!searchResults?.length) {
          new Notice(`No results found for "${this.query}"`); // Couldn't find the game.
          return;
        }

        this.callback(null, searchResults);
      } catch (err) {
        this.callback(err as Error);
      }
      this.close();
    }
  }

  submitEnterCallback(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.isComposing) {
      this.searchGame();
    }
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.createEl('h2', { text: 'Search Game' });

    contentEl.createDiv({ cls: 'game-search-plugin__search-modal--input' }, settingItem => {
      new TextComponent(settingItem)
        .setValue(this.query)
        .setPlaceholder('Search by title')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener('keydown', this.submitEnterCallback.bind(this));
    });

    new Setting(contentEl).addButton(btn => {
      return (this.okBtnRef = btn
        .setButtonText('Search')
        .setCta()
        .onClick(() => {
          this.searchGame();
        }));
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
