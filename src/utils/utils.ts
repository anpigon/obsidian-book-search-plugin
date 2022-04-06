import { Book, BookModel } from 'src/models/book.model';

export function replaceIllegalFileNameCharactersInString(string: string) {
  return string.replace(/[\\,#%&{}/*<>$":@.]*/g, '');
}

export function isISBN(str: string) {
  return /^(97(8|9))?\d{9}(\d|X)$/.test(str);
}

export function makeFrontMater(book: Book): string {
  return new BookModel(book).toFrontMatter();
}

export function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
}
