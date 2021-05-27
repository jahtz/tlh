import {AOSentence, aoSentenceFormat} from "./sentence";
import {childElementReader, indent, XmlFormat} from "../editor/xmlLib";
import {AOTextContent} from "../editor/documentBody";

export interface Paragraph {
  type: 'AOParagraph';
  s: AOSentence;
}

export const paragraphFormat: XmlFormat<Paragraph> = {
  read: (el) => childElementReader(el, 's', aoSentenceFormat).map(aoParagraph),
  write: ({s}) => ['<p>', ...aoSentenceFormat.write(s).map(indent), '</p>']
}

function aoParagraph(s: AOSentence): Paragraph {
  return {type: 'AOParagraph', s};
}

export function isAOParagraph(c: AOTextContent): c is Paragraph {
  return c.type === 'AOParagraph';
}