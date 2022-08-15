export interface FrontMatter {
  [key: string]: string | string[];
}

export interface Book {
  title: string; // 책 제목
  author: string; // 저자
  category?: string; // 카테고리
  publisher?: string; // 출판사
  publishDate?: string; // 출판일
  totalPage?: number | string; // 전체 페이지
  coverUrl?: string; // 커버 URL
  coverSmallUrl?: string; // 커버 URL
  coverMediumUrl?: string; // 커버 URL
  coverLargeUrl?: string; // 커버 URL
  status?: string; // 읽기 상태(읽기전, 읽는중, 읽기완료)
  startReadDate?: string; // 읽기 시작한 일시
  finishReadDate?: string; // 읽기 완료한 일시
  myRate?: number | string; //나의 평점
  bookNote?: string; //서평 기록 여부
  isbn10?: string;
  isbn13?: string;
  isbn?: string;
  link?: string;
  description?: string;
}

export class BookModel implements Book {
  title: string;
  author: string;
  category?: string;
  publisher?: string;
  publishDate?: string;
  totalPage?: number | string;
  coverUrl?: string;
  coverSmallUrl?: string;
  coverMediumUrl?: string;
  coverLargeUrl?: string;
  status?: string;
  startReadDate?: string;
  finishReadDate?: string;
  myRate?: number | string;
  bookNote?: string;
  isbn10?: string;
  isbn13?: string;
  isbn?: string;
  link?: string;
  description?: string;

  constructor(book: Book) {
    this.title = book.title ?? '';
    this.author = book.author ?? '';
    this.category = book.category ?? '';
    this.publisher = book.publisher ?? '';
    this.publishDate = book.publishDate ?? '';
    this.totalPage = book.totalPage ?? '';
    this.coverUrl = book.coverUrl ?? '';
    this.coverSmallUrl = book.coverSmallUrl ?? '';
    this.coverMediumUrl = book.coverMediumUrl ?? '';
    this.coverLargeUrl = book.coverLargeUrl ?? '';
    this.status = book.status ?? '';
    this.startReadDate = book.startReadDate ?? '';
    this.finishReadDate = book.finishReadDate ?? '';
    this.myRate = book.myRate ?? '';
    this.bookNote = book.bookNote ?? '';
    this.isbn10 = book.isbn10 ?? '';
    this.isbn13 = book.isbn13 ?? '';
    this.isbn = book.isbn ?? '';
    this.link = book.link ?? '';
    this.description = book.description ?? '';
  }

  toJSON() {
    return { ...this };
  }
}
