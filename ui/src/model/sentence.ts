import {indent, XmlFormat} from "../editor/xmlLib";
import {AOGap, aoGapFormat, isAOGap} from "./sentenceContent/gap";
import {AOLineBreak, aoLineBreakFormat, isAOLineBreak} from "./sentenceContent/linebreak";
import {AOWord, aoWordFormat} from "./sentenceContent/word";
import {failure, flattenResults, Result} from '../functional/result';

export interface AOSentence {
  type: 'AOSentence';
  content: AOSentenceContent[];
}

export const aoSentenceFormat: XmlFormat<AOSentence> = {
  read: (el) => {
    const children: Result<AOSentenceContent, string[]>[] = Array.from(el.children)
      .map(aoSentenceContentFormat.read);

    return flattenResults<AOSentenceContent, string[]>(children)
      .transformContent(
        (content) => aoSentence(content),
        (errs) => errs.flat()
      )
  },
  write: ({content}) => ['<s>', ...content.flatMap(aoSentenceContentFormat.write).map(indent), '</s>']
}

function aoSentence(content: AOSentenceContent[]): AOSentence {
  return {type: 'AOSentence', content};
}

export type AOSentenceContent = AOGap | AOLineBreak | AOWord;

const aoSentenceContentFormat: XmlFormat<AOSentenceContent> = {
  read: (el) => {
    switch (el.tagName) {
      case 'gap':
        return aoGapFormat.read(el);
      case 'lb':
        return aoLineBreakFormat.read(el);
      case 'w':
        return aoWordFormat.read(el);
      default:
        return failure([`Found illegal tag name ${el.tagName}`]);
    }
  },
  write: (sc) => {
    if (isAOGap(sc)) {
      return aoGapFormat.write(sc);
    } else if (isAOLineBreak(sc)) {
      return aoLineBreakFormat.write(sc);
    } else /* if(isAOWord(sc)) */{
      return aoWordFormat.write(sc);
    }
  }
}