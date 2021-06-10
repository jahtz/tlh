import {childElementReader, indent, readAttribute, XmlFormat, xmlLoadError, XmlLoadError} from './xmlLib';
import {failure, flattenResults, mapResult, Result, transformResult, zipResult} from '../functional/result';
import {
  isParagraphSeparator,
  ParagraphSeparator,
  ParagraphSeparatorDouble,
  paragraphSeparatorDoubleXmlFormat,
  paragraphSeparatorXmlFormat
} from '../model/paragraphSeparators';
import {isAOParagraph, Paragraph, paragraphFormat} from '../model/paragraph';
import {AOManuscripts, aoManuscriptsFormat} from '../model/sentenceContent/aoManuscripts';

export interface AOBody {
  type: 'AOBody';
  aoManuscripts: AOManuscripts;
  div1: AODiv1;
}

export const aoBodyFormat: XmlFormat<AOBody> = {
  read: (el) => transformResult(
    zipResult(
      childElementReader(el, 'AO:Manuscripts', aoManuscriptsFormat),
      childElementReader(el, 'div1', aoDiv1Format)
    ),
    ([m, div1]) => aoBody(m, div1),
    (errs) => errs.flat()
  ),
  write: ({aoManuscripts, div1}) => [
    '<body>',
    ...aoManuscriptsFormat.write(aoManuscripts).map(indent),
    ...aoDiv1Format.write(div1).map(indent),
    '</body>'
  ]
};

function aoBody(aoManuscripts: AOManuscripts, div1: AODiv1): AOBody {
  return {type: 'AOBody', aoManuscripts, div1};
}

// AODiv1

export interface AODiv1 {
  type: string;
  text: AOText;
}

const aoDiv1Format: XmlFormat<AODiv1> = {
  read: (el) => mapResult(
    childElementReader(el, 'text', aoTextFormat),
    (aoText) => aoDiv1(aoText, readAttribute(el, 'type', (v) => v || ''))
  ),
  write: ({text, type}) => [
    `<div1 type="${type}">`,
    ...aoTextFormat.write(text).map(indent),
    '</div1>'
  ]
};

function aoDiv1(text: AOText, type: string): AODiv1 {
  return {text, type};
}

// AOText


export type AOTextContent = ParagraphSeparator | ParagraphSeparatorDouble | Paragraph;

const aoTextContentFormat: XmlFormat<AOTextContent> = {
  read: (el) => {
    switch (el.tagName) {
    case 'p':
      return paragraphFormat.read(el);
    case 'parsep':
      return paragraphSeparatorXmlFormat.read(el);
    case 'parsep_dbl':
      return paragraphSeparatorDoubleXmlFormat.read(el);
    default:
      return failure([xmlLoadError(`Found illegal tag name ${el.tagName}`, [el.tagName])]);
    }
  },
  write: (tc) => {
    if (isAOParagraph(tc)) {
      return paragraphFormat.write(tc);
    } else if (isParagraphSeparator(tc)) {
      return paragraphSeparatorXmlFormat.write(tc);
    } else /* if(isParagraphSeparatorDouble(tc)) */ {
      return paragraphSeparatorDoubleXmlFormat.write(tc);
    }
  }
};


export interface AOText {
  type: 'AOText';
  content: AOTextContent[];
}


const aoTextFormat: XmlFormat<AOText> = {
  read: (el) => {
    const childResults: Result<AOTextContent, XmlLoadError[]>[] = Array.from(el.children).map(aoTextContentFormat.read);

    return transformResult(
      flattenResults(childResults),
      (contents) => aoText(contents),
      (errors) => errors.flat()
    );
  },
  write: ({content}) => [
    '<text>',
    ...content.flatMap(aoTextContentFormat.write).map(indent),
    '</text>'
  ]
};

function aoText(content: AOTextContent[]): AOText {
  return {type: 'AOText', content};
}