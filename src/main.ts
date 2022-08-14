import { MarkdownView, Notice, Plugin } from 'obsidian';
import { BookSearchModal } from './book_search_modal';
import { BookSuggestModal } from './book_suggest_modal';
import { CursorJumper } from './editor/cursor_jumper';
import { Book } from './models/book.model';

import { BookSearchSettingTab, BookSearchPluginSettings, DEFAULT_SETTINGS } from './settings/settings';
import { replaceVariableSyntax, makeFileName, makeFrontMater, getTemplateContents } from './utils/utils';

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

  async searchBookMetadata(query: string, writer: MetadataWriter): Promise<void> {
    try {
      // open modal for book search
      const book = await this.openBookSearchModal(query);

      let frontMatter = replaceVariableSyntax(book, this.settings.frontmatter);
      if (this.settings.useDefaultFrontmatter) {
        frontMatter = makeFrontMater(book, frontMatter, this.settings.defaultFrontmatterKeyType);
      }
      frontMatter = frontMatter.trim();

      let renderedContents = '';

      const templateFile = this.settings.templateFile?.trim();
      if (templateFile) {
        const templateContents = await getTemplateContents(this.app, templateFile);
        renderedContents = replaceVariableSyntax(book, templateContents);
      } else {
        const content = replaceVariableSyntax(book, this.settings.content);
        renderedContents = frontMatter ? `---\n${frontMatter}\n---\n${content}` : content;
      }

      await writer(book, renderedContents);

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
      const filePath = `${this.settings.folder.replace(/\/$/, '')}/${fileName}.md`;
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

  async openBookSearchModal(query = ''): Promise<Book> {
    return new Promise((resolve, reject) => {
      new BookSearchModal(this.app, query, (error, results) => {
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
