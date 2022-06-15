import { Book, FrontMatter } from 'src/models/book.model';
import { DefaultFrontmatterKeyType } from 'src/settings/settings';

// == Format Syntax == //
export const NUMBER_REGEX = /^-?[0-9]*$/;
export const DATE_REGEX = /{{DATE(\+-?[0-9]+)?}}/;
export const DATE_REGEX_FORMATTED = /{{DATE:([^}\n\r+]*)(\+-?[0-9]+)?}}/;

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

export function getDate(input?: { format?: string; offset?: number }) {
  let duration;

  if (input.offset !== null && input.offset !== undefined && typeof input.offset === 'number') {
    duration = window.moment.duration(input.offset, 'days');
  }

  return input.format
    ? window.moment().add(duration).format(input.format)
    : window.moment().add(duration).format('YYYY-MM-DD');
}

export function replaceDateInString(input: string) {
  let output: string = input;

  while (DATE_REGEX.test(output)) {
    const dateMatch = DATE_REGEX.exec(output);
    let offset: number;

    if (dateMatch[1]) {
      const offsetString = dateMatch[1].replace('+', '').trim();
      const offsetIsInt = NUMBER_REGEX.test(offsetString);
      if (offsetIsInt) offset = parseInt(offsetString);
    }
    output = replacer(output, DATE_REGEX, getDate({ offset: offset }));
  }

  while (DATE_REGEX_FORMATTED.test(output)) {
    const dateMatch = DATE_REGEX_FORMATTED.exec(output);
    const format = dateMatch[1];
    let offset: number;

    if (dateMatch[2]) {
      const offsetString = dateMatch[2].replace('+', '').trim();
      const offsetIsInt = NUMBER_REGEX.test(offsetString);
      if (offsetIsInt) offset = parseInt(offsetString);
    }

    output = replacer(output, DATE_REGEX_FORMATTED, getDate({ format, offset }));
  }

  return output;
}

function replacer(str: string, reg: RegExp, replaceValue) {
  return str.replace(reg, function () {
    return replaceValue;
  });
}
