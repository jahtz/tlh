import {indent, readAttribute, XmlFormat, XmlLoadError, xmlLoadError} from "../../editor/xmlLib";
import {failure, flattenResults, Result, success, transformResult} from '../../functional/result';
import {AOWordContent, aoWordContentFormat} from "../wordContent/wordContent";
import {MorphologicalAnalysis, readMorphAnalysis, writeMorphAnalysisAttribute} from "../morphologicalAnalysis";
import {AOSentenceContent} from "../sentence";
import {aoBasicText} from "../wordContent/basicText";

// AOWord

function readSelectedMorphology(value: string | null): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export interface AOWord {
  type: 'AOWord';
  content: AOWordContent[];
  language?: string;
  mrp0sel?: string;
  morphologies?: MorphologicalAnalysis[];
  transliteration?: string;
}


export const aoWordFormat: XmlFormat<AOWord> = {
  read: (el: Element) => {
    const readContent: Result<AOWordContent[], XmlLoadError[][]> = flattenResults(
      Array.from(el.childNodes).map((x: ChildNode) => {
        if (x instanceof Text) {
          return success(aoBasicText(x.textContent || ''));
        } else if (x instanceof Element) {
          return aoWordContentFormat.read(x);
        } else {
          return failure([xmlLoadError(`Illegal node type found`, [el.tagName])]);
        }
      })
    );

    const morphologies: MorphologicalAnalysis[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((i) => readAttribute(el, `mrp${i}`, (v) => readMorphAnalysis(i, v)))
      .flatMap((x) => x ? [x] : []);

    return transformResult(
      readContent,
      (content) => {
        return {
          type: 'AOWord',
          content,
          language: readAttribute(el, 'lg', (v) => v || undefined),
          mrp0sel: readAttribute(el, 'mrp0sel', readSelectedMorphology),
          morphologies,
          transliteration: readAttribute(el, 'trans', (v) => v || undefined)
        }
      },
      (errs) => errs.flat()
    );
  },
  write: ({content, mrp0sel, type, transliteration, morphologies, language}) =>
    [
      `<w trans="${transliteration}"`,
      indent(`mrp0sel="${mrp0sel || ''}"`),
      ...(language ? [indent(`lg="${language}"`)] : []),
      ...(morphologies || []).flatMap(writeMorphAnalysisAttribute).map(indent),
      `>${content.map(aoWordContentFormat.write).join('')}</w>`
    ]
}

export function parsedWord(...content: (AOWordContent | string)[]): AOWord {
  return {type: 'AOWord', content: content.map((c) => typeof c === 'string' ? aoBasicText(c) : c)};
}

export function isAOWord(c: AOSentenceContent): c is AOWord {
  return c.type === 'AOWord';
}