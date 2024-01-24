import {
  MarkdownView,
  Notice,
  ProgressBarComponent,
  Plugin,
  TAbstractFile,
  TFolder,
  TFile,
  Vault,
  normalizePath,
} from 'obsidian';
import { GameSearchModal } from '@views/game_search_modal';
import { GameSuggestModal } from '@views/game_suggest_modal';
import { ConfirmRegenModal } from '@views/confirm_regen_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { RAWGGame, RAWGGameFromSearch } from '@models/rawg_game.model';
import { GameSearchSettingTab, GameSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import { replaceVariableSyntax, makeFileName, stringToMap, mapToString } from '@utils/utils';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { SteamAPI } from '@src/apis/steam_api';
import {
  getTemplateContents,
  applyTemplateTransformations,
  useTemplaterPluginInFile,
  executeInlineScriptsTemplates,
} from '@utils/template';
import { syncSteamWishlist, syncOwnedSteamGames } from '@utils/steamSync';

export type Nullable<T> = T | undefined | null;

export default class GameSearchPlugin extends Plugin {
  settings: GameSearchPluginSettings;
  rawgApi: RAWGAPI;
  steamApi: Nullable<SteamAPI>;

  async onload() {
    console.info(
      `[Game Search][Info] version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`,
    );
    await this.loadSettings();
    this.rawgApi = new RAWGAPI(this.settings.rawgApiKey);

    if (this.settings.syncSteamOnStart) {
      this.syncSteam(false);
    }

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('gamepad-2', 'Create new game note', () => this.createNewGameNote(null)); // passing null/undefined for params here will force user to game search
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('obsidian-game-search-plugin-ribbon-class');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-game-search-modal',
      name: 'Create new game note',
      callback: () => this.createNewGameNote(undefined), // passing null/undefined for params here will force user to game search
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
      const loadingNotice = new Notice('regenerating game metadata', 0);
      const progress = new ProgressBarComponent(loadingNotice.noticeEl);

      const gamesFolder = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.folder)) as TFolder;

      let index = 0;
      const fileCount = gamesFolder.children.length;

      Vault.recurseChildren(gamesFolder, async (f: TAbstractFile) => {
        const file = f as TFile;
        if (!!file && file.name.includes('.md')) {
          try {
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
              // get the current contents of the file
              // (and the current metadata)
              let existingContent = await this.app.vault.read(file);
              let existingMetadata: Nullable<Map<string, string>> = undefined;
              if (existingContent.indexOf('---') === 0) {
                existingMetadata = stringToMap(existingContent.match(/---[\S\s]*?---/)[0]);
              }

              // re-generate the file contents based on (ostensibly) the changed template
              const regeneratedContent = await this.getRenderedContents(game);

              // find/capture the regenerated metadata
              let regeneratedMetadata: Nullable<Map<string, string>> = undefined;
              if (regeneratedContent.indexOf('---') === 0) {
                const foundRegeneratedMetadata = regeneratedContent.match(/---[\S\s]*?---/);
                if (foundRegeneratedMetadata.length > 0) {
                  regeneratedMetadata = stringToMap(foundRegeneratedMetadata[0]);
                }
              }

              // if the existing metadata has keys that were injected
              // as a part of the users steam sync settings we do want to
              // preserve those
              if (regeneratedMetadata instanceof Map && existingMetadata instanceof Map) {
                if (existingMetadata.has('steamId')) {
                  regeneratedMetadata.set('steamId', existingMetadata.get('steamId'));
                }
                if (this.settings.metaDataForWishlistedSteamGames instanceof Map) {
                  for (const [key, value] of this.settings.metaDataForWishlistedSteamGames) {
                    if (existingMetadata.has(key)) {
                      regeneratedMetadata.set(key, value);
                    }
                  }
                }
                if (this.settings.metaDataForOwnedSteamGames instanceof Map) {
                  for (const [key, value] of this.settings.metaDataForOwnedSteamGames) {
                    if (existingMetadata.has(key)) {
                      regeneratedMetadata.set(key, value);
                    }
                  }
                }
              }

              // replace the metdata in the existing content with the newly generated metadata
              // if there is no metadata in the existing file, just toss the newly generated metadata at the top of the content

              // make sure the first instance of `---` is at the start of the file and therefor declaring metadata
              // (and not some horizontal rule later in the file)
              if (existingContent.indexOf('---') === 0) {
                existingContent = existingContent.replace(
                  /---[\S\s]*?---/,
                  '---\n' + mapToString(regeneratedMetadata) + '\n---',
                );
              } else if (regeneratedMetadata) {
                existingContent = '---\n' + mapToString(regeneratedMetadata) + '\n---\n' + existingContent;
              }

              await this.app.vault.modify(file, existingContent);

              const p = ++index / fileCount;
              progress.setValue(p * 100);
              if (p >= 1) {
                loadingNotice.setMessage('game notes regeneration complete');
              }
            }
          } catch (error) {
            console.error('[GameSearch][Regen] unexpected error regenerating file ' + file.name);
          }
        }
      });
    }).open();
  }

  async syncSteam(alertUninitializedApi: boolean): Promise<void> {
    // always check to see if steamApi needs to be initialized on sync,
    // it's possible the user has entered API credentials at any point in time.
    if (this.steamApi === undefined && this.settings.steamApiKey && this.settings.steamUserId) {
      console.info('[Game Search][Steam Sync]: initializing steam api');
      this.steamApi = new SteamAPI(this.settings.steamApiKey, this.settings.steamUserId);
    }

    if (this.steamApi !== undefined) {
      const loadingNotice = new Notice('syncing steam games (owned)', 0);
      let progress = new ProgressBarComponent(loadingNotice.noticeEl);
      await syncOwnedSteamGames(
        this.app.vault,
        this.settings,
        this.app.fileManager,
        this.rawgApi,
        this.steamApi,
        async (params, openAfterCreate, extraData) => await this.createNewGameNote(params, openAfterCreate, extraData),
        (percent: number) => progress.setValue((percent * 100) / 2),
      );

      loadingNotice.setMessage('syncing steam games (wishlist)');
      progress = new ProgressBarComponent(loadingNotice.noticeEl);
      await syncSteamWishlist(
        this.app.vault,
        this.settings,
        this.app.fileManager,
        this.rawgApi,
        this.steamApi,
        async (params, openAfterCreate, extraData) => await this.createNewGameNote(params, openAfterCreate, extraData),
        (percent: number) => progress.setValue(50 + (percent * 100) / 2),
      );
      loadingNotice.setMessage('steam sync complete');
    } else if (alertUninitializedApi) {
      console.warn('[Game Search][SteamSync]: steam api not initialized');
      this.showNotice('Steam Api not initialized. Did you enter your steam API key and user Id in plugin settings?');
    }
  }

  async parseFileMetadata(file: TFile): Promise<any> {
    const fileManager = this.app.fileManager;
    return new Promise<any>(accept => {
      fileManager.processFrontMatter(file, (data: any) => {
        accept(data);
      });
    });
  }

  async createNewGameNote(
    params: Nullable<{
      game: Nullable<RAWGGame>;
      steamId: Nullable<number>;
      overwriteFile: boolean;
    }>,
    openAfterCreate = true,
    extraData?: Map<string, string>, // key/values for metadata to add to file
  ): Promise<void> {
    try {
      const game = params?.game ?? (await this.searchGameMetadata());

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
      if (existing && params.overwriteFile) {
        await this.app.vault.delete(existing, true);
      }
      const targetFile = await this.app.vault.create(filePath, renderedContents);

      // if use Templater plugin
      await useTemplaterPluginInFile(this.app, targetFile);

      if (params.steamId) {
        this.app.fileManager.processFrontMatter(targetFile, (data: any) => {
          data.steamId = params.steamId;
          if (extraData && extraData instanceof Map) {
            for (const [key, value] of extraData) {
              data[key] = value;
            }
          }
          return data;
        });
      }

      // open file
      if (openAfterCreate) {
        await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
        activeLeaf.setEphemeralState({ rename: 'all' });

        // cursor focus
        await new CursorJumper(this.app).jumpToNextCursorLocation();
      }
    } catch (err) {
      console.warn('[Game Search][Create Game Note][unexpected] ' + err);
      if (!err.message.toLowerCase().contains('already exists')) {
        this.showNotice(err);
      }
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
