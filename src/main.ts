import { MarkdownView, Notice, Plugin, TFile } from 'obsidian';

import { BookSearchModal } from '@views/book_search_modal';
import { BookSuggestModal } from '@views/book_suggest_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { Book } from '@models/book.model';
import { BookSearchSettingTab, BookSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import {
  getTemplateContents,
  applyTemplateTransformations,
  useTemplaterPluginInFile,
  executeInlineScriptsTemplates,
} from '@utils/template';
import { replaceVariableSyntax, makeFileName, applyDefaultFrontMatter, toStringFrontMatter } from '@utils/utils';

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

    console.log(`Book Search: version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`);
  }

  showNotice(message: string | Error | undefined) {
    try {
      new Notice(message?.toString() ?? 'Error occurred. Please check the console.');
    } catch {
      // eslint-disable
    }
  }

  // open modal for book search
  async searchBookMetadata(query?: string): Promise<Book | undefined> {
    const searchedBooks = await this.openBookSearchModal(query);
    return await this.openBookSuggestModal(searchedBooks);
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
      const replacedVariable = replaceVariableSyntax(book, applyTemplateTransformations(templateContents));
      return executeInlineScriptsTemplates(book, replacedVariable);
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
    try {
      const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!markdownView) {
        console.warn('Can not find an active markdown view');
        this.showNotice('Can not find an active markdown view');
        return;
      }

      if (!markdownView.file) {
        console.warn('Can not find file from the active markdown view');
        this.showNotice('Can not find file from the active markdown view');
        return;
      }

      // TODO: Try using a search query on the selected text
      const book = await this.searchBookMetadata(markdownView.file.basename);

      if (!markdownView.editor) {
        console.warn('Can not find editor from the active markdown view');
        return;
      }

      if (!book) {
        console.warn('Book not found');
        this.showNotice('Book not found');
        return;
      }

      const renderedContents = await this.getRenderedContents(book);
      markdownView.editor.replaceRange(renderedContents, { line: 0, ch: 0 });
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async createNewBookNote(): Promise<void> {
    try {
      const book = await this.searchBookMetadata();
      if (!book) {
        console.warn('Book not found');
        this.showNotice('Book not found');
        return;
      }
      const renderedContents = await this.getRenderedContents(book);

      // TODO: If the same file exists, it asks if you want to overwrite it.
      // create new File
      const fileName = makeFileName(book, this.settings.fileNameFormat);
      const filePath = `${this.settings.folder}/${fileName}`;
      const targetFile = await this.app.vault.create(filePath, renderedContents);

      // if use Templater plugin
      await useTemplaterPluginInFile(this.app, targetFile);
      this.openNewBookNote(targetFile);
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async openNewBookNote(targetFile: TFile) {
    if (!this.settings.openPageOnCompletion) return;

    // open file
    const activeLeaf = this.app.workspace.getLeaf();
    if (!activeLeaf) {
      console.warn('No active leaf');
      return;
    }

    await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
    activeLeaf.setEphemeralState({ rename: 'all' });
    // cursor focus
    await new CursorJumper(this.app).jumpToNextCursorLocation();
  }

  async openBookSearchModal(query = ''): Promise<Book[]> {
    return new Promise((resolve, reject) => {
      return new BookSearchModal(this, query, (error, results) => {
        return error ? reject(error) : resolve(results ?? []);
      }).open();
    });
  }

  async openBookSuggestModal(books: Book[]): Promise<Book | undefined> {
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
