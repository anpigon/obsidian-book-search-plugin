import { MarkdownView, Notice, Plugin, TAbstractFile, TFolder, TFile, Vault, normalizePath } from 'obsidian';
import { GameSearchModal } from '@views/game_search_modal';
import { GameSuggestModal } from '@views/game_suggest_modal';
import { ConfirmRegenModal } from '@views/confirm_regen_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { RAWGGame, RAWGGameFromSearch } from '@models/rawg_game.model';
import { GameSearchSettingTab, GameSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import { replaceVariableSyntax, makeFileName } from '@utils/utils';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { SteamAPI } from '@src/apis/steam_api';
import {
  getTemplateContents,
  applyTemplateTransformations,
  useTemplaterPluginInFile,
  executeInlineScriptsTemplates,
} from '@utils/template';

export type Nullable<T> = T | undefined | null;

export default class GameSearchPlugin extends Plugin {
  settings: GameSearchPluginSettings;
  rawgApi: RAWGAPI;
  steamApi: Nullable<SteamAPI>;

  async onload() {
    console.log(
      `[Game Search][Info] version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`,
    );
    await this.loadSettings();
    this.rawgApi = new RAWGAPI(this.settings.rawgApiKey);

    this.syncSteam(false);

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('gamepad-2', 'Create new game note', () => this.createNewGameNote());
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
      editorCallback: () => this.insertMetadata(),
    });

    this.addCommand({
      id: 'sync steam',
      name: 'Sync Steam',
      callback: () => this.syncSteam(true),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new GameSearchSettingTab(this.app, this));
  }

  showNotice(message: unknown) {
    try {
      new Notice(message?.toString());
    } catch {
      // eslint-disable
    }
  }

  // open modal for game search
  async searchGameMetadata(query?: string): Promise<RAWGGame> {
    const searchedGames = await this.openGameSearchModal(query);
    return await this.openGameSuggestModal(searchedGames);
  }

  async getRenderedContents(game: RAWGGame) {
    const { templateFile } = this.settings;

    const templateContents = await getTemplateContents(this.app, templateFile);
    const replacedVariable = replaceVariableSyntax(game, applyTemplateTransformations(templateContents));
    return executeInlineScriptsTemplates(game, replacedVariable);
  }

  async insertMetadata(): Promise<void> {
    try {
      const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!markdownView) {
        console.warn('[Game Search][Insert Metadata] Can not find an active markdown view');
        return;
      }

      const game = await this.searchGameMetadata(markdownView.file.basename);

      if (!markdownView.editor) {
        console.warn('[Game Search][Insert Metadata] Can not find editor from the active markdown view');
        return;
      }

      const renderedContents = await this.getRenderedContents(game);
      markdownView.editor.replaceRange(renderedContents, { line: 0, ch: 0 });
    } catch (err) {
      console.warn('[Game Search][Insert Metadata][unexepected] ' + err);
      this.showNotice(err);
    }
  }

  async regenerateAllGameNotesMetadata(): Promise<void> {
    new ConfirmRegenModal(this.app, () => {
      const gamesFolder = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.folder)) as TFolder;

      Vault.recurseChildren(gamesFolder, async (f: TAbstractFile) => {
        const file = f as TFile;
        if (!!file && file.name.includes('.md')) {
          const noteMetadata = await this.parseFileMetadata(f as TFile);
          const q: Nullable<string> =
            noteMetadata.id ?? noteMetadata.Id ?? noteMetadata.slug ?? noteMetadata.Slug ?? null;

          let game: Nullable<RAWGGame> = null;
          if (q) {
            game = await this.rawgApi.getBySlugOrId(q);
          } else {
            const games = await this.rawgApi.getByQuery(noteMetadata.name ?? noteMetadata.name ?? file.name);
            game = await this.rawgApi.getBySlugOrId(games[0].slug);
          }

          if (game) {
            this.createNewGameNote(game, true);
          }
        }
      });
    }).open();
  }

  async parseFileMetadata(file: TFile): Promise<any> {
    const fileManager = this.app.fileManager;
    return new Promise<any>(accept => {
      fileManager.processFrontMatter(file, (data: any) => {
        accept(data);
      });
    });
  }

  async syncSteam(alertUninitializedApi: boolean): Promise<void> {
    if (this.steamApi === undefined && this.settings.steamApiKey && this.settings.steamUserId) {
      this.steamApi = new SteamAPI(this.settings.steamApiKey, this.settings.steamUserId);
    }

    if (this.steamApi !== undefined) {
      this.steamApi.getOwnedGames();
    } else if (alertUninitializedApi) {
      this.showNotice('Steam Api not initialized. Did you enter your steam API key and user Id in plugin settings?');
    }
  }

  async createNewGameNote(g: RAWGGame = null, overwriteFile = false): Promise<void> {
    try {
      const game = g ?? (await this.searchGameMetadata());

      // open file
      const activeLeaf = this.app.workspace.getLeaf();
      if (!activeLeaf) {
        console.warn('[Game Search][Create Game Note] No active leaf');
        return;
      }

      const renderedContents = await this.getRenderedContents(game);

      // If the same file exists, it asks if you want to overwrite it.
      // create new File
      const fileName = makeFileName(game, this.settings.fileNameFormat);
      const filePath = `${this.settings.folder}/${fileName}`;
      const existing = this.app.vault.getAbstractFileByPath(normalizePath(filePath));
      if (existing && overwriteFile) {
        await this.app.vault.delete(existing, true);
      }
      const targetFile = await this.app.vault.create(filePath, renderedContents);

      // if use Templater plugin
      await useTemplaterPluginInFile(this.app, targetFile);

      // open file
      await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
      activeLeaf.setEphemeralState({ rename: 'all' });

      // cursor focus
      await new CursorJumper(this.app).jumpToNextCursorLocation();
    } catch (err) {
      console.warn('[Game Search][Create Game Note][unexpected] ' + err);
      this.showNotice(err);
    }
  }

  async openGameSearchModal(query = ''): Promise<RAWGGameFromSearch[]> {
    return new Promise((resolve, reject) => {
      return new GameSearchModal(this, this.rawgApi, query, (error, results) => {
        return error ? reject(error) : resolve(results);
      }).open();
    });
  }

  async openGameSuggestModal(games: RAWGGameFromSearch[]): Promise<RAWGGame> {
    return new Promise((resolve, reject) => {
      return new GameSuggestModal(this.app, this.rawgApi, games, (error, selectedGame) => {
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
