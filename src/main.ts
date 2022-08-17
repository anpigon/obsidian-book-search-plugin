import * as path from 'path';
import { MarkdownView, Notice, Plugin } from 'obsidian';

import { BookSearchModal } from '@views/book_search_modal';
import { BookSuggestModal } from '@views/book_suggest_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { Book } from '@models/book.model';
import { BookSearchSettingTab, BookSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import { getTemplateContents, applyTemplateTransformations } from '@utils/template';
import { replaceVariableSyntax, makeFileName, applyDefaultFrontMatter, toStringFrontMatter } from '@utils/utils';

type MetadataWriter = (book: Book, metadata: string) => Promise<void>;

export default class BookSearchPlugin extends Plugin {
  settings: BookSearchPluginSettings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('book', 'Create new book note', () => this.createNewBookNote());
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('obsidian-book-search-plugin-ribbon-class');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-book-search-modal',
      name: 'Create new book note',
      callback: () => this.createNewBookNote(),
    });

    this.addCommand({
      id: 'open-book-search-modal-to-insert',
      name: 'Insert the metadata',
      callback: () => this.insertMetadata(),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new BookSearchSettingTab(this.app, this));
  }

  async searchBookMetadata(query: string, callback: MetadataWriter): Promise<void> {
    try {
      // open modal for book search
      const searchedBooks = await this.openBookSearchModal(query);
      const selectedBook = await this.openBookSuggestModal(searchedBooks);
      const renderedContents = await this.getRenderedContents(selectedBook);
      await callback(selectedBook, renderedContents);

      // cursor focus
      await new CursorJumper(this.app).jumpToNextCursorLocation();
    } catch (err) {
      console.warn(err);
      try {
        new Notice(err.toString());
      } catch {
        // eslint-disable
      }
    }
  }

  async getRenderedContents(book: Book) {
    const {
      templateFile,
      useDefaultFrontmatter,
      defaultFrontmatterKeyType,
      frontmatter, // @deprecated
      content, // @deprecated
    } = this.settings;

    if (templateFile) {
      const templateContents = await getTemplateContents(this.app, templateFile);
      return replaceVariableSyntax(book, applyTemplateTransformations(templateContents));
    }

    let replacedVariableFrontmatter = replaceVariableSyntax(book, frontmatter); // @deprecated
    if (useDefaultFrontmatter) {
      replacedVariableFrontmatter = toStringFrontMatter(
        applyDefaultFrontMatter(book, replacedVariableFrontmatter, defaultFrontmatterKeyType),
      );
    }
    const replacedVariableContent = replaceVariableSyntax(book, content);

    return replacedVariableFrontmatter
      ? `---\n${replacedVariableFrontmatter}\n---\n${replacedVariableContent}`
      : replacedVariableContent;
  }

  async insertMetadata(): Promise<void> {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      console.warn('Can not find an active markdown view');
      return;
    }
    await this.searchBookMetadata(markdownView.file.basename, async (_, metadata) => {
      if (!markdownView.editor) {
        console.warn('Can not find editor from the active markdown view');
        return;
      }
      markdownView.editor.replaceRange(metadata, { line: 0, ch: 0 });
    });
  }

  async createNewBookNote(): Promise<void> {
    await this.searchBookMetadata('', async (book, metadata) => {
      const fileName = makeFileName(book, this.settings.fileNameFormat);
      const filePath = path.join(this.settings.folder, `${fileName}.md`);
      const targetFile = await this.app.vault.create(filePath, metadata);

      // open file
      const activeLeaf = this.app.workspace.getLeaf();
      if (!activeLeaf) {
        console.warn('No active leaf');
        return;
      }
      await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
      activeLeaf.setEphemeralState({ rename: 'all' });
    });
  }

  async openBookSearchModal(query = ''): Promise<Book[]> {
    return new Promise((resolve, reject) => {
      return new BookSearchModal(this, query, (error, results) => {
        return error ? reject(error) : resolve(results);
      }).open();
    });
  }

  async openBookSuggestModal(books: Book[]): Promise<Book> {
    return new Promise((resolve, reject) => {
      return new BookSuggestModal(this.app, books, (error, selectedBook) => {
        return error ? reject(error) : resolve(selectedBook);
      }).open();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
