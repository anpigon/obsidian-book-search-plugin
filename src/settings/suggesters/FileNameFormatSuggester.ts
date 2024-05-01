import type { App } from 'obsidian';
import { TextInputSuggest } from './suggest';

// == Format Syntax Suggestion == //
export const DATE_SYNTAX = '{{DATE}}';
export const DATE_FORMAT_SYNTAX = '{{DATE:}}';
export const DATE_SYNTAX_SUGGEST_REGEX = /{{D?A?T?E?}?}?$/i;
export const DATE_FORMAT_SYNTAX_SUGGEST_REGEX = /{{D?A?T?E?:?$|{{DATE:[^\n\r}]*}}$/i;

export const AUTHOR_SYNTAX = '{{author}}';
export const AUTHOR_SYNTAX_SUGGEST_REGEX = /{{a?u?t?h?o?r?}?}?$/i;

export const TITLE_SYNTAX = '{{title}}';
export const TITLE_SYNTAX_SUGGEST_REGEX = /{{t?i?t?l?e?}?}?$/i;

export class FileNameFormatSuggest extends TextInputSuggest<string> {
  private lastInput = '';

  constructor(
    public app: App,
    public inputEl: HTMLInputElement | HTMLTextAreaElement,
  ) {
    super(app, inputEl);
  }

  getSuggestions(inputStr: string): string[] {
    const cursorPosition: number = this.inputEl.selectionStart;
    const lookbehind = 15;
    const inputBeforeCursor = inputStr.substr(cursorPosition - lookbehind, lookbehind);
    const suggestions: string[] = [];

    this.processToken(inputBeforeCursor, (match: RegExpMatchArray, suggestion: string) => {
      this.lastInput = match[0];
      suggestions.push(suggestion);
    });

    return suggestions;
  }

  selectSuggestion(item: string): void {
    const cursorPosition: number = this.inputEl.selectionStart;
    const lastInputLength: number = this.lastInput.length;
    const currentInputValue: string = this.inputEl.value;
    let insertedEndPosition = 0;

    const insert = (text: string, offset = 0) => {
      return `${currentInputValue.substr(
        0,
        cursorPosition - lastInputLength + offset,
      )}${text}${currentInputValue.substr(cursorPosition)}`;
    };

    this.processToken(item, (_match, suggestion) => {
      if (item.contains(suggestion)) {
        this.inputEl.value = insert(item);
        insertedEndPosition = cursorPosition - lastInputLength + item.length;

        if (item === DATE_FORMAT_SYNTAX) {
          insertedEndPosition -= 2;
        }
      }
    });

    this.inputEl.trigger('input');
    this.close();
    this.inputEl.setSelectionRange(insertedEndPosition, insertedEndPosition);
  }

  renderSuggestion(value: string, el: HTMLElement): void {
    if (value) el.setText(value);
  }

  private processToken(input: string, callback: (match: RegExpMatchArray, suggestion: string) => void) {
    const dateFormatMatch = DATE_FORMAT_SYNTAX_SUGGEST_REGEX.exec(input);
    if (dateFormatMatch) callback(dateFormatMatch, DATE_FORMAT_SYNTAX);

    const dateMatch = DATE_SYNTAX_SUGGEST_REGEX.exec(input);
    if (dateMatch) callback(dateMatch, DATE_SYNTAX);

    const authorMatch = AUTHOR_SYNTAX_SUGGEST_REGEX.exec(input);
    if (authorMatch) callback(authorMatch, AUTHOR_SYNTAX);

    const titleMatch = TITLE_SYNTAX_SUGGEST_REGEX.exec(input);
    if (titleMatch) callback(titleMatch, TITLE_SYNTAX);
  }
}
