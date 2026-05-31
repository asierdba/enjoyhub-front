export type ContentType = 'book' | 'movie' | 'series' | 'game';

export interface Author {
  authorId: number;
  authorName: string;
}

export interface Genre {
  genreId: number;
  name: string;
}

export interface BookDetail {
  publisher?: string;
  isbn?: string;
  pageCount?: number;
}

export interface Content {
  contentId: number;
  title: string;
  releaseYear: number;
  description: string;
  image: string;
  type: ContentType;
  emotionId?: number;
  authors?: Author[];
  genres?: Genre[];
  book?: BookDetail;
}
