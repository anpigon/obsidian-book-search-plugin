/* eslint-disable @typescript-eslint/no-explicit-any  */

import type { Nullable } from '../main';
import { requestUrl } from 'obsidian';
import { SteamResponse, OwnedSteamGames, SteamGame, SteamWishlistedGame } from '@models/steam_game.model';

export class SteamAPI {
  constructor(private readonly key: string, private readonly steamId: string) {}

  async tryGetGame(nameQuery: string): Promise<Nullable<SteamGame>> {
    try {
      const games = await this.getOwnedGames();
      for (const game of games) {
        if (
          game.name.toLowerCase().contains(nameQuery.toLowerCase()) ||
          nameQuery.toLowerCase().contains(game.name.toLowerCase())
        ) {
          return game;
        }
      }
    } catch (error) {
      console.warn('[Game Search][Steam API][tryGetGame]' + error);
      throw error;
    }

    return null;
  }

  async getOwnedGames(): Promise<SteamGame[]> {
    try {
      const apiURL = new URL('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('steamid', this.steamId);
      apiURL.searchParams.append('include_appinfo', 'true');
      apiURL.searchParams.append('format', 'json');

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const results = res.json as SteamResponse<OwnedSteamGames>;

      if (results?.response?.game_count <= 0) {
        return [];
      }

      return results.response.games;
    } catch (error) {
      console.warn('[Game Search][Steam API][getOwnedGames]' + error);
      throw error;
    }
  }

  async getWishlist(): Promise<Map<number, SteamWishlistedGame>> {
    try {
      const apiURL = new URL('https://store.steampowered.com/wishlist/profiles/' + this.steamId + '/wishlistdata/');
      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });
      const m = new Map<number, SteamWishlistedGame>();
      for (const [k, v] of Object.entries(res.json)) {
        m.set(parseInt(k), v as SteamWishlistedGame);
      }
      return m;
    } catch (error) {
      console.warn('[Game Search][Steam API][getWishlist]' + error);
      throw error;
    }
  }

  async getPlayerStatsForGames(
    gameIds: string[],
  ): Promise<{ [key: string]: { playtime_forever: Nullable<number>; playtime_2weeks: Nullable<number> } } | undefined> {
    try {
      const apiURL = new URL('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('format', 'json');

      let htmlJsonArrayContent = '';
      const htmlCommaAndSpace = '%2C%20';

      for (const id of gameIds) {
        htmlJsonArrayContent += `${id}${htmlCommaAndSpace}`;
      }

      const query = `%22appids_filter%22%3A%20%5B${htmlJsonArrayContent.substring(
        0,
        htmlJsonArrayContent.length - htmlCommaAndSpace.length,
      )}%5D%2C%20%22steamid%22%3A%20${this.steamId}`;

      const res = await requestUrl({
        url: `${apiURL.href}&input_json={${query}}`,
        method: 'GET',
      });

      const games = res?.json?.response?.games;
      if (games) {
        const ret: { [key: string]: { playtime_forever: Nullable<number>; playtime_2weeks: Nullable<number> } } = {};
        for (const game of games) {
          ret[game.appid] = {
            playtime_forever: game.playtime_forever,
            playtime_2weeks: game.playtime_2weeks,
          };
        }
        return ret;
      }

      return undefined;
    } catch (error) {
      console.warn('[Game Search][Steam API][getWishlist]' + error);
      throw error;
    }
  }
}
