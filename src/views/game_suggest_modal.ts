import { App, SuggestModal } from 'obsidian';
import { Game } from '@models/game.model';

export class GameSuggestModal extends SuggestModal<Game> {
  constructor(
    app: App,
    private readonly suggestion: Game[],
    private onChoose: (error: Error | null, result?: Game) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(_query: string): Game[] {
    return this.suggestion;
  }

  // Renders each suggestion item.
  renderSuggestion(game: Game, el: HTMLElement) {
    const title = game.name;
    const publishDate = game.released ? `(${game.released})` : '';
    el.createEl('div', { text: title });
    el.createEl('small', { text: publishDate });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(game: Game) {
    this.onChoose(null, game);
  }
}
