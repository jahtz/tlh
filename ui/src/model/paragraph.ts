import {AOSentence} from './sentence';

export type AOTextContent = ParagraphSeparator | ParagraphSeparatorDouble | Paragraph;

export interface Paragraph {
  type: 'AOParagraph';
  s: AOSentence;
}

export function isAOParagraph(c: AOTextContent): c is Paragraph {
  return c.type === 'AOParagraph';
}

// ParagraphSeparator

export interface ParagraphSeparator {
  type: 'ParagraphSeparator'
}

export const paragraphSeparator: ParagraphSeparator = {type: 'ParagraphSeparator'};

export function isParagraphSeparator(c: AOTextContent): c is ParagraphSeparator {
  return c.type === 'ParagraphSeparator';
}

// ParagraphSeparatorDouble

export interface ParagraphSeparatorDouble {
  type: 'ParagraphSeparatorDouble'
}

export const paragraphSeparatorDouble: ParagraphSeparatorDouble = {type: 'ParagraphSeparatorDouble'};

export function isParagraphSeparatorDouble(c: AOTextContent): c is ParagraphSeparatorDouble {
  return c.type === 'ParagraphSeparatorDouble';
}