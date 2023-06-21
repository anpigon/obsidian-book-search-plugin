import { App, SuggestModal } from 'obsidian';
import { RAWGAPI } from '@src/apis/rawg_games_api';
import { Game, GameFromSearch, releaseYearForGame } from '@models/game.model';

export class GameSuggestModal extends SuggestModal<GameFromSearch> {
  constructor(
    app: App,
    private api: RAWGAPI,
    private readonly suggestion: GameFromSearch[],
    private onChoose: (error: Error | null, result?: Game) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(_query: string): GameFromSearch[] {
    return this.suggestion;
  }

  // Renders each suggestion item.
  renderSuggestion(game: GameFromSearch, el: HTMLElement) {
    const title = game.name;
    const publishDate = game.released ? `(${releaseYearForGame(game)})` : '';
    el.createEl('div', { text: title });
    el.createEl('small', { text: publishDate });
  }

  // Perform action on the selected suggestion.
  async onChooseSuggestion(game: GameFromSearch) {
    const g = await this.api.getBySlugOrId(game.slug);
    this.onChoose(null, g);
  }
}
