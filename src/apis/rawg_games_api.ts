import { RAWGListResponse, GameFromSearch, Game } from '@models/game.model';
import { requestUrl } from 'obsidian';

export class RAWGAPI {
  constructor(private readonly key: string) {}

  async getByQuery(query: string): Promise<GameFromSearch[]> {
    try {
      const apiURL = new URL('https://api.rawg.io/api/games');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('search', query);

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const searchResults = res.json as RAWGListResponse<GameFromSearch>;

      if (!searchResults?.count) {
        return [];
      }

      return searchResults.results;
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  async getBySlug(slug: string): Promise<Game> {
    try {
      const apiURL = new URL('https://api.rawg.io/api/games/' + slug);
      apiURL.searchParams.append('key', this.key);

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const searchResults = res.json as Game;

      if (searchResults == null) {
        throw new Error('game not found or error parsing data');
      }

      return searchResults;
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }
}
