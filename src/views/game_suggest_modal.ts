import { App, SuggestModal } from 'obsidian';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { RAWGGame, RAWGGameFromSearch, releaseYearForRAWGGame } from '@models/rawg_game.model';

export class GameSuggestModal extends SuggestModal<RAWGGameFromSearch> {
  constructor(
    app: App,
    private api: RAWGAPI,
    private readonly suggestion: RAWGGameFromSearch[],
    private onChoose: (error: Error | null, result?: RAWGGame) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(_query: string): RAWGGameFromSearch[] {
    return this.suggestion;
  }

  // Renders each suggestion item.
  renderSuggestion(game: RAWGGameFromSearch, el: HTMLElement) {
    const title = game.name;
    const publishDate = game.released ? `(${releaseYearForRAWGGame(game)})` : '';
    el.createEl('div', { text: title });
    el.createEl('small', { text: publishDate });
  }

  // Perform action on the selected suggestion.
  async onChooseSuggestion(game: RAWGGameFromSearch) {
    const g = await this.api.getBySlugOrId(game.slug);
    this.onChoose(null, g);
  }
}
