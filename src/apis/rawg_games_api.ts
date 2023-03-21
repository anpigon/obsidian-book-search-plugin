import { RAWGResponse, Game } from '@models/game.model';
import { requestUrl } from 'obsidian';

export class RAWGAPI {
  constructor(private readonly key: string) {}

  async getByQuery(query: string): Promise<Game[]> {
    try {
      const apiURL = new URL('https://api.rawg.io/api/games');
      apiURL.searchParams.append('key', this.key);
      apiURL.searchParams.append('search', query);

      const res = await requestUrl({
        url: apiURL.href,
        method: 'GET',
      });

      const searchResults = res.json as RAWGResponse<Game>;

      if (!searchResults?.count) {
        return [];
      }

      return searchResults.results;
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }
}
