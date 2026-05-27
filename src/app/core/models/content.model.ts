export type ContentType = 'book' | 'movie' | 'series' | 'game';

export interface Content {
  contentId: number;
  title: string;
  releaseYear: number;
  description: string;
  image: string;
  type: ContentType;
  emotionId?: number;
}
