import { Book } from '@models/book.model';
import * as utils from './utils';

jest.mock('@settings/settings', () => jest.fn());

describe('util.js', () => {
  const book: Book = {
    title: '코스모스',
    author: '칼 세이건',
    authors: ['칼 세이건'],
  };

  it('replaceIllegalFileNameCharactersInString', () => {
    expect(utils.replaceIllegalFileNameCharactersInString('재레드 다이아몬드의 <대변동 : 위기, 선택, 변화>')).toBe(
      '재레드 다이아몬드의 대변동 위기 선택 변화',
    );
  });

  it('makeFileName 1', () => {
    expect(utils.makeFileName(book)).toBe('코스모스 - 칼 세이건.md');
  });

  it('makeFileName 2', () => {
    const newBook = {
      ...book,
      author: '',
    };
    expect(utils.makeFileName(newBook)).toBe('코스모스.md');
  });

  it('makeFileName 3', () => {
    expect(utils.makeFileName(book, '{{author}}-{{title}}')).toBe('칼 세이건-코스모스.md');
  });

  it('makeFileName 4', () => {
    expect(utils.makeFileName(book, '{{author}}-{{title}}')).toBe('칼 세이건-코스모스.md');
  });

  it('makeFileName 5', () => {
    const newBook = {
      ...book,
      title: '코스모스 : 창백한 푸른점',
    };
    expect(utils.makeFileName(newBook, '{{title}} - {{author}}')).toBe('코스모스 창백한 푸른점 - 칼 세이건.md');
  });
});
