import {AOSentence, aoSentenceFormat} from './sentence';
import {childElementReader, indent, XmlFormat} from '../editor/xmlLib';
import {AOTextContent} from '../editor/documentBody';
import {mapResult} from '../functional/result';

export interface Paragraph {
  type: 'AOParagraph';
  s: AOSentence;
}

export const paragraphFormat: XmlFormat<Paragraph> = {
  read: (el) => mapResult(childElementReader(el, 's', aoSentenceFormat), aoParagraph),
  write: ({s}) => ['<p>', ...aoSentenceFormat.write(s).map(indent), '</p>']
};

function aoParagraph(s: AOSentence): Paragraph {
  return {type: 'AOParagraph', s};
}

export function isAOParagraph(c: AOTextContent): c is Paragraph {
  return c.type === 'AOParagraph';
}