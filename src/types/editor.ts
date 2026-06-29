export interface HeaderData {
  text: string;
  level: number;
}

export interface ParagraphData {
  text: string;
}

export interface ListData {
  style: 'ordered' | 'unordered';
  items: string[];
}

export interface ImageData {
  file: {
    url: string;
    [key: string]: unknown;
  };
  caption?: string;
  withBorder?: boolean;
  withBackground?: boolean;
  stretched?: boolean;
}

export interface EmbedData {
  service: string;
  source: string;
  embed: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface TableData {
  withHeadings?: boolean;
  content: string[][];
}

export interface QuoteData {
  text: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface CodeData {
  code: string;
}

export interface DelimiterData {
  [key: string]: unknown;
}

export type EditorBlockData =
  | HeaderData
  | ParagraphData
  | ListData
  | ImageData
  | EmbedData
  | TableData
  | QuoteData
  | CodeData
  | DelimiterData;

export interface EditorBlock {
  id?: string;
  type: string;
  data: EditorBlockData;
}

export interface EditorContent {
  time: number;
  blocks: EditorBlock[];
  version: string;
}
