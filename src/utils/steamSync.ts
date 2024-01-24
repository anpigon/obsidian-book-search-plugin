import { TFile, Notice, Vault, FileManager, normalizePath } from 'obsidian';
import { GameSearchPluginSettings } from '@settings/settings';
import type { Nullable } from '../main';
import { SteamAPI } from '@src/apis/steam_api';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { makeFileName } from '@utils/utils';
import { RAWGGame, RAWGGameFromSearch } from '@models/rawg_game.model';

export async function findAndSyncSteamGame(
  vault: Vault,
  settings: any,
  fileManager: FileManager,
  rawgApi: RAWGAPI,
  name: string,
  steamId: number,
  createNewGameNote: (
    params: { game: Nullable<RAWGGame>; steamId: Nullable<number>; overwriteFile: boolean },
    openAfterCreate: boolean,
    extraData?: Map<string, string>,
  ) => Promise<void>,
  metadata: Map<string, string>,
  logDescription: string,
): Promise<void> {
  let rawgGame: Nullable<RAWGGameFromSearch>;
  try {
    rawgGame = (await rawgApi.getByQuery(name))[0];
  } catch (rawgApiError) {
    console.warn('[Game Search][Steam Sync][ERROR] getting RAWG game for ' + logDescription + ' game ' + name);
    console.warn(rawgApiError);
  }

  if (!rawgGame) {
    new Notice('Unable to sync ' + logDescription + ' game ' + name);
    console.warn('[Game Search][Steam Sync] wishlist SKIPPING! ' + name);
    return;
  }

  const possibleExistingFilePath = makeFileName(rawgGame, settings.fileNameFormat);
  const existingGameFile = vault.getAbstractFileByPath(
    normalizePath(settings.folder + '/' + possibleExistingFilePath),
  ) as TFile;

  if (existingGameFile) {
    console.info(
      '[Game Search][Steam Sync]: found match for vault file: ' +
        existingGameFile.name +
        ' and ' +
        logDescription +
        ' game: ' +
        name,
    );

    fileManager.processFrontMatter(existingGameFile, data => {
      data.steamId = steamId;
      if (metadata && metadata instanceof Map) {
        for (const [key, value] of metadata) {
          data[key.trim()] = value.trim();
        }
      }
      return data;
    });
  } else {
    console.info('[Game Search][Steam Sync] creating note for ' + name);
    try {
      const rawgGameDetails = await rawgApi.getBySlugOrId(rawgGame.slug);
      await createNewGameNote({ game: rawgGameDetails, steamId: steamId, overwriteFile: false }, false, metadata);
    } catch (rawgOrWriteError) {
      console.warn('[Game Search][Steam Sync][ERROR] getting details and writing file for steam game ' + name);
      console.warn(rawgOrWriteError);
    }
  }
}

export async function syncSteamWishlist(
  vault: Vault,
  settings: any,
  fileManager: FileManager,
  rawgApi: RAWGAPI,
  steamApi: SteamAPI,
  createNewGameNote: (
    args: { game: RAWGGame; steamId: number; overwriteFile: boolean },
    openFile: boolean,
    extraData: Map<string, string>,
  ) => Promise<void>,
  processedPercent: (percent: number) => void,
): Promise<void> {
  if (!steamApi) return;
  console.info('[Game Search][Steam Sync]: fetching wishlist from steam api');
  const wishlistGames = await steamApi.getWishlist();
  let index = 0;
  const amount = wishlistGames.size;

  for (const [key, value] of wishlistGames) {
    await findAndSyncSteamGame(
      vault,
      settings,
      fileManager,
      rawgApi,
      value.name,
      key,
      createNewGameNote,
      settings.metaDataForWishlistedSteamGames,
      'wishlisted steam',
    );
    processedPercent(++index / amount);
  }
}

export async function syncOwnedSteamGames(
  vault: Vault,
  settings: GameSearchPluginSettings,
  fileManager: FileManager,
  rawgApi: RAWGAPI,
  steamApi: SteamAPI,
  createNewGameNote: (
    args: { game: RAWGGame; steamId: number; overwriteFile: boolean },
    openFile: boolean,
    extraData: Map<string, string>,
  ) => Promise<void>,
  processedPercent: (percent: number) => void,
): Promise<void> {
  if (!steamApi) return;
  console.info('[Game Search][Steam Sync]: fetching owned games from steam api');
  const ownedSteamGames = await steamApi.getOwnedGames();

  console.info('[Game Search][Steam Sync]: begin steam game directory iteration');
  let index = 0;
  const amount = ownedSteamGames.length;

  for (let i = 0; i < ownedSteamGames.length; i++) {
    await findAndSyncSteamGame(
      vault,
      settings,
      fileManager,
      rawgApi,
      ownedSteamGames[i].name,
      ownedSteamGames[i].appid,
      createNewGameNote,
      settings.metaDataForOwnedSteamGames,
      'owned steam',
    );
    processedPercent(++index / amount);
  }
}
