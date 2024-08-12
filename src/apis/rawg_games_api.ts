import { RAWGListResponse, RAWGGameFromSearch, RAWGGame } from '@models/rawg_game.model';
import { requestUrl } from 'obsidian';

export class RAWGAPI {
  constructor(private readonly key: string) {}

  async getByQuery(query: string, exact = false): Promise<RAWGGameFromSearch[]> {
    try {
      const apiURL = new URL('https://api.rawg.io/api/games');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('search', query);
      apiURL.searchParams.append('search_exact', exact.toString());

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const searchResults = res.json as RAWGListResponse<RAWGGameFromSearch>;

      if (!searchResults?.count) {
        return [];
      }

      return searchResults.results;
    } catch (error) {
      console.warn('[Game Search][RAWG API] ' + error);
      throw error;
    }
  }

  async getBySlugOrId(slugOrId: string | number): Promise<RAWGGame> {
    try {
      const apiURL = new URL('https://api.rawg.io/api/games/' + slugOrId);
      apiURL.searchParams.append('key', this.key);

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const searchResults = res.json as RAWGGame;

      if (searchResults == null) {
        throw new Error('game not found or error parsing data');
      }

      return searchResults;
    } catch (error) {
      console.warn('[Game Search][RAWG API] ' + error);
      throw error;
    }
  }
}
