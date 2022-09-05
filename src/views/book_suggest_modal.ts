import { App, SuggestModal } from 'obsidian';
import { Book } from '@models/book.model';

export class BookSuggestModal extends SuggestModal<Book> {
  constructor(
    app: App,
    private readonly suggestion: Book[],
    private onChoose: (error: Error | null, result?: Book) => void,
  ) {
    super(app);
  }

  // Returns all available suggestions.
  getSuggestions(query: string): Book[] {
    return this.suggestion.filter(book => {
      const searchQuery = query?.toLowerCase();
      return (
        book.title?.toLowerCase().includes(searchQuery) ||
        book.author?.toLowerCase().includes(searchQuery) ||
        book.publisher?.toLowerCase().includes(searchQuery)
      );
    });
  }

  // Renders each suggestion item.
  renderSuggestion(book: Book, el: HTMLElement) {
    const title = book.title;
    const publisher = book.publisher ? `, ${book.publisher}` : '';
    const publishDate = book.publishDate ? `(${book.publishDate})` : '';
    const totalPage = book.totalPage ? `, p${book.totalPage}` : '';
    const subtitle = `${book.author}${publisher}${publishDate}${totalPage}`;
    el.createEl('div', { text: title });
    el.createEl('small', { text: subtitle });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(book: Book) {
    this.onChoose(null, book);
  }
}
