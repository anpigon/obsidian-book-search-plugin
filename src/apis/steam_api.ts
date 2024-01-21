/* eslint-disable @typescript-eslint/no-explicit-any  */

import { requestUrl } from 'obsidian';

export class SteamAPI {
  constructor(private readonly key: string, private readonly steamId: string) {}

  async getOwnedGames(): Promise<any[]> {
    try {
      // todo: steam api
      const apiURL = new URL('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('steamid', this.steamId);
      apiURL.searchParams.append('format', 'json');

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      console.log('@*88888888888888888888888888888888');
      console.dir(res.json);
      console.log('@*88888888888888888888888888888888');

      // todo: parse into model
      const searchResults = [];

      // if (!searchResults?.count) {
      //   return [];
      // }

      return searchResults;
    } catch (error) {
      console.warn(error);
      throw error;
    }

    return [];
  }
}
