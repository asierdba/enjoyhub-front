import { Book } from './book.model';

export interface BookList {
  id: number;
  userId: number;
  name: string;
  books: Book[];
}
