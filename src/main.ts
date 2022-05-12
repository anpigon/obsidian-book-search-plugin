import { Notice, Plugin } from 'obsidian';
import { BookSearchModal } from './book_search_modal';
import { BookSuggestModal } from './book_suggest_modal';
import { CursorJumper } from './editor/cursor_jumper';
import { Book } from './models/book.model';

import { BookSearchSettingTab, BookSearchPluginSettings, DEFAULT_SETTINGS } from './settings/settings';
import { replaceVariableSyntax, makeFileName, makeFrontMater } from './utils/utils';

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

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new BookSearchSettingTab(this.app, this));
  }

  async createNewBookNote(): Promise<void> {
    try {
      // open modal for book search
      const book = await this.openBookSearchModal();

      let frontMatter = replaceVariableSyntax(book, this.settings.frontmatter);
      if (this.settings.useDefaultFrontmatter) {
        frontMatter = makeFrontMater(book, frontMatter, this.settings.defaultFrontmatterKeyType);
      }
      frontMatter = frontMatter.trim();

      const content = replaceVariableSyntax(book, this.settings.content);
      const fileContent = frontMatter ? `---\n${frontMatter}\n---\n${content}` : content;

      const fileName = makeFileName(book);
      const filePath = `${this.settings.folder.replace(/\/$/, '')}/${fileName}.md`;
      const targetFile = await this.app.vault.create(filePath, fileContent);

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
    } catch (err) {
      console.warn(err);
      try {
        new Notice(err.toString());
      } catch {
        // eslint-disable
      }
    }
  }

  async openBookSearchModal(): Promise<Book> {
    return new Promise((resolve, reject) => {
      new BookSearchModal(this.app, (error, results) => {
        if (error) return reject(error);
        new BookSuggestModal(this.app, results, (error2, selectedBook) => {
          if (error2) return reject(error2);
          resolve(selectedBook);
        }).open();
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
