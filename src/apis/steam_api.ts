/* eslint-disable @typescript-eslint/no-explicit-any  */

import { requestUrl } from 'obsidian';
import { SteamResponse, OwnedSteamGames, SteamGame, SteamWishlistedGame } from '@models/steam_game.model';

export class SteamAPI {
  constructor(private readonly key: string, private readonly steamId: string) {}

  async getOwnedGames(): Promise<SteamGame[]> {
    try {
      // todo: steam api
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
}
