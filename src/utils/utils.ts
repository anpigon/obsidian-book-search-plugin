import { Book, FrontMatter } from 'src/models/book.model';
import { DefaultFrontmatterKeyType } from 'src/settings/settings';

export function replaceIllegalFileNameCharactersInString(string: string) {
  return string.replace(/[\\,#%&{}/*<>$":@.]*/g, '');
}

export function isISBN(str: string) {
  return /^(97(8|9))?\d{9}(\d|X)$/.test(str);
}

export function makeFileName(book: Book) {
  const titleForFileName = replaceIllegalFileNameCharactersInString(book.title);
  if (!book.author) {
    return titleForFileName;
  }
  const authorForFileName = replaceIllegalFileNameCharactersInString(book.author);
  return `${titleForFileName} - ${authorForFileName}`;
}

export function makeFrontMater(
  book: Book,
  frontmatter: FrontMatter | string,
  keyType: DefaultFrontmatterKeyType = DefaultFrontmatterKeyType.snakeCase,
): string {
  const frontMater =
    keyType === DefaultFrontmatterKeyType.camelCase
      ? book
      : Object.entries(book).reduce((acc, [key, value]) => {
          acc[camelToSnakeCase(key)] = value;
          return acc;
        }, {});

  const addFrontMatter = typeof frontmatter === 'string' ? parseFrontMatter(frontmatter) : frontmatter;
  for (const key in addFrontMatter) {
    const addValue = addFrontMatter[key]?.toString().trim() ?? '';
    if (frontMater[key] && frontMater[key] !== addValue) {
      frontMater[key] = `${frontMater[key]} ${addValue}`;
    } else {
      frontMater[key] = addValue;
    }
  }

  return Object.entries(frontMater)
    .map(([key, val]) => {
      return `${key}: ${val?.toString().trim() ?? ''}`;
    })
    .join('\n');
}

export function replaceVariableSyntax(book: Book, targetText: string): string {
  const entries = Object.entries(book);
  return entries
    .reduce((text, [key, val = '']) => text.replace(new RegExp(`{{${key}}}`, 'ig'), val), targetText)
    .replace(/{{.+}}/gi, '');
}

export function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter?.toLowerCase()}`);
}

export function parseFrontMatter(frontMatterString: string) {
  if (!frontMatterString) return {};
  return frontMatterString
    .split('\n')
    .map(item => {
      const index = item.indexOf(':');
      if (index === -1) return [item.trim(), ''];

      const key = item.slice(0, index)?.trim();
      const value = item.slice(index + 1)?.trim();
      return [key, value];
    })
    .reduce((acc, [key, value]) => {
      if (key) {
        acc[key] = value?.trim() ?? '';
      }
      return acc;
    }, {});
}

export function toStringFrontMatter(frontMatter: FrontMatter): string {
  return Object.entries(frontMatter)
    .map(([key, value]) => `${key}: ${value ?? ''}`)
    .join('\n');
}
