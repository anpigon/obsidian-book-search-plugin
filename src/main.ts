import { MarkdownView, Notice, Plugin } from 'obsidian';

import { GameSearchModal } from '@views/game_search_modal';
import { GameSuggestModal } from '@views/game_suggest_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { Game } from '@models/game.model';
import { GameSearchSettingTab, GameSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import {
  getTemplateContents,
  applyTemplateTransformations,
  useTemplaterPluginInFile,
  executeInlineScriptsTemplates,
} from '@utils/template';
import { replaceVariableSyntax, makeFileName } from '@utils/utils';

export default class GameSearchPlugin extends Plugin {
  settings: GameSearchPluginSettings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('game', 'Create new game note', () => this.createNewGameNote());
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('obsidian-game-search-plugin-ribbon-class');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-game-search-modal',
      name: 'Create new game note',
      callback: () => this.createNewGameNote(),
    });

    this.addCommand({
      id: 'open-game-search-modal-to-insert',
      name: 'Insert the metadata',
      callback: () => this.insertMetadata(),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new GameSearchSettingTab(this.app, this));

    console.log(`Game Search: version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`);
  }

  showNotice(message: unknown) {
    try {
      new Notice(message?.toString());
    } catch {
      // eslint-disable
    }
  }

  // open modal for game search
  async searchGameMetadata(query?: string): Promise<Game> {
    const searchedGames = await this.openGameSearchModal(query);
    return await this.openGameSuggestModal(searchedGames);
  }

  async getRenderedContents(game: Game) {
    const { templateFile } = this.settings;

    const templateContents = await getTemplateContents(this.app, templateFile);
    const replacedVariable = replaceVariableSyntax(game, applyTemplateTransformations(templateContents));
    return executeInlineScriptsTemplates(game, replacedVariable);
  }

  async insertMetadata(): Promise<void> {
    try {
      const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!markdownView) {
        console.warn('Can not find an active markdown view');
        return;
      }

      // TODO: Try using a search query on the selected text
      const game = await this.searchGameMetadata(markdownView.file.basename);

      if (!markdownView.editor) {
        console.warn('Can not find editor from the active markdown view');
        return;
      }

      const renderedContents = await this.getRenderedContents(game);
      markdownView.editor.replaceRange(renderedContents, { line: 0, ch: 0 });
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async createNewGameNote(): Promise<void> {
    try {
      const game = await this.searchGameMetadata();

      // open file
      const activeLeaf = this.app.workspace.getLeaf();
      if (!activeLeaf) {
        console.warn('No active leaf');
        return;
      }

      const renderedContents = await this.getRenderedContents(game);

      // TODO: If the same file exists, it asks if you want to overwrite it.
      // create new File
      const fileName = makeFileName(game, this.settings.fileNameFormat);
      const filePath = `${this.settings.folder}/${fileName}`;
      const targetFile = await this.app.vault.create(filePath, renderedContents);

      // if use Templater plugin
      await useTemplaterPluginInFile(this.app, targetFile);

      // open file
      await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
      activeLeaf.setEphemeralState({ rename: 'all' });

      // cursor focus
      await new CursorJumper(this.app).jumpToNextCursorLocation();
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async openGameSearchModal(query = ''): Promise<Game[]> {
    return new Promise((resolve, reject) => {
      return new GameSearchModal(this, this.settings.rawgApiKey, query, (error, results) => {
        return error ? reject(error) : resolve(results);
      }).open();
    });
  }

  async openGameSuggestModal(games: Game[]): Promise<Game> {
    return new Promise((resolve, reject) => {
      return new GameSuggestModal(this.app, games, (error, selectedGame) => {
        return error ? reject(error) : resolve(selectedGame);
      }).open();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
