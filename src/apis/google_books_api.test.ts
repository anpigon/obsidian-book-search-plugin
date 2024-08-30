import { Book } from '@models/book.model';
import { GoogleBooksApi } from './google_books_api';
import { Type, VolumeInfo } from './models/google_books_response';

describe('Book creation', () => {
  const volumeInfo: VolumeInfo = {
    title: 'Flow',
    subtitle: 'The Psychology of Optimal Experience',
    authors: ['Mihaly Csikszentmihalyi'],
    publisher: 'Harper Collins',
    publishedDate: '2009-10-13',
    description:
      '\u003cp\u003e“Csikszentmihalyi arrives at an insight that many of us can intuitively grasp, despite our insistent (and culturally supported) denial of this truth. That is, it is not what happens to us that determines our happiness, but the manner in which we make sense of that reality. . . . The manner in which Csikszentmihalyi integrates research on consciousness, personal psychology and spirituality is illuminating.” —Los Angeles Times Book Review\u003c/p\u003e\u003cp\u003eThe bestselling classic that holds the key to unlocking meaning, creativity, peak performance, and true happiness. \u003c/p\u003e\u003cp\u003eLegendary psychologist Mihaly Csikszentmihalyi\'s famous investigations of "optimal experience" have revealed that what makes an experience genuinely satisfying is a state of consciousness called flow. During flow, people typically experience deep enjoyment, creativity, and a total involvement with life. In this new edition of his groundbreaking classic work, Csikszentmihalyi ("the leading researcher into ‘flow states’" —Newsweek) demonstrates the ways this positive state can be controlled, not just left to chance. Flow: The Psychology of Optimal Experience teaches how, by ordering the information that enters our consciousness, we can discover true happiness, unlock our potential, and greatly improve the quality of our lives.\u003c/p\u003e',
    industryIdentifiers: [
      {
        type: Type.Isbn10,
        identifier: '0061876720',
      },
      {
        type: Type.Isbn13,
        identifier: '9780061876721',
      },
    ],
    readingModes: {
      text: true,
      image: false,
    },
    pageCount: 336,
    printType: 'BOOK',
    categories: ['Psychology / Creative Ability', 'Psychology / Applied Psychology', 'Psychology / Personality'],
    averageRating: 4,
    ratingsCount: 1404,
    maturityRating: 'NOT_MATURE',
    allowAnonLogging: true,
    contentVersion: '1.4.3.0.preview.2',
    panelizationSummary: {
      containsEpubBubbles: false,
      containsImageBubbles: false,
    },
    imageLinks: {
      smallThumbnail:
        'http://books.google.com/books/content?id=QVjPsd1UukEC&printsec=frontcover&img=1&zoom=5&edge=curl&imgtk=AFLRE71MowoDIZtesyLc6kiXVlnvQznYNgPj7fIAedD1BNhyuPtLC5i3QuDwZKM_5Q-FZXaf0tMfBx2ijWUBEcVqPmYkK6ApHUMJVxsIlEP2maBsJJHIU2_De5ioR5KVAF0za48f39aA&source=gbs_api',
      thumbnail:
        'http://books.google.com/books/content?id=QVjPsd1UukEC&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE71SvX9ABv9Ensxle-fchWlnS8UEYiU3Symajbi_0pbwhrZFP3ahRLKcK_RjWJP9pRMtbjSSK3SDbr_UXWQ8GbCnncMVCs37gYWGedBePMEbk4G9eCsiiWy22ejJIJ3H3bx53Huq&source=gbs_api',
    },
    language: 'en',
    previewLink: 'http://books.google.fr/books?id=QVjPsd1UukEC&hl=&source=gbs_api',
    infoLink: 'https://play.google.com/store/books/details?id=QVjPsd1UukEC&source=gbs_api',
    canonicalVolumeLink: 'https://play.google.com/store/books/details?id=QVjPsd1UukEC',
  };

  const api: GoogleBooksApi = new GoogleBooksApi('default', true);
  const book: Book = api.createBookItem(volumeInfo);

  it('Title', () => {
    expect(book.title).toEqual(volumeInfo.title);
  });

  it('Subtitle', () => {
    expect(book.subtitle).toEqual(volumeInfo.subtitle);
  });

  it('Author', () => {
    expect(book.author).toEqual(api.formatList(volumeInfo.authors));
  });

  it('Category', () => {
    expect(book.category).toEqual(api.formatList(volumeInfo.categories));
  });

  it('Publisher', () => {
    expect(book.publisher).toEqual(volumeInfo.publisher);
  });

  it('Published date', () => {
    expect(book.publishDate).toEqual(volumeInfo.publishedDate);
  });

  it('Total pages', () => {
    expect(book.totalPage).toEqual(volumeInfo.pageCount);
  });

  it('Cover URL', () => {
    expect(book.coverUrl).toEqual(volumeInfo.imageLinks.thumbnail);
  });

  it('Cover small URL', () => {
    expect(book.coverSmallUrl).toEqual(volumeInfo.imageLinks.smallThumbnail);
  });

  it('Description', () => {
    expect(book.description).toEqual(volumeInfo.description);
  });

  it('Link', () => {
    expect(book.link).toEqual(volumeInfo.canonicalVolumeLink);
  });

  it('Preview link', () => {
    expect(book.previewLink).toEqual(volumeInfo.previewLink);
  });

  it('ISBN 10', () => {
    expect(book.isbn10).toEqual(volumeInfo.industryIdentifiers[0].identifier);
  });

  it('ISBN 13', () => {
    expect(book.isbn13).toEqual(volumeInfo.industryIdentifiers[1].identifier);
  });

  it('Enables Edge curl', () => {
    expect(book.coverUrl).toContain('&edge=curl');
    expect(book.coverSmallUrl).toContain('&edge=curl');
  });

  it('Disables Edge curl', () => {
    const api: GoogleBooksApi = new GoogleBooksApi('default', false);
    const book: Book = api.createBookItem(volumeInfo);

    expect(book.coverUrl).not.toContain('&edge=curl');
    expect(book.coverSmallUrl).not.toContain('&edge=curl');
  });
});
