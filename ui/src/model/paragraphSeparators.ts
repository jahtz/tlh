import {XmlFormat} from "../editor/xmlLib";
import {AOTextContent} from "../editor/documentBody";
import {success} from "../functional/result";

// ParagraphSeparator

export interface ParagraphSeparator {
  type: 'ParagraphSeparator'
}

export const paragraphSeparator: ParagraphSeparator = {type: 'ParagraphSeparator'};

export const paragraphSeparatorXmlFormat: XmlFormat<ParagraphSeparator> = {
  read: () => success(paragraphSeparator),
  write: () => ['<parsep/>']
};

export function isParagraphSeparator(c: AOTextContent): c is ParagraphSeparator {
  return c.type === 'ParagraphSeparator';
}

// ParagraphSeparatorDouble

export interface ParagraphSeparatorDouble {
  type: 'ParagraphSeparatorDouble'
}

export const paragraphSeparatorDouble: ParagraphSeparatorDouble = {type: 'ParagraphSeparatorDouble'};

export const paragraphSeparatorDoubleXmlFormat: XmlFormat<ParagraphSeparatorDouble> = {
  read: () => success(paragraphSeparatorDouble),
  write: () => ['<parsep_dbl/>']
}

export function isParagraphSeparatorDouble(c: AOTextContent): c is ParagraphSeparatorDouble {
  return c.type === 'ParagraphSeparatorDouble';
}