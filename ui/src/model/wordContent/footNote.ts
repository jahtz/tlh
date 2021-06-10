import {failableAttributeReader, readAttribute, XmlFormat, xmlLoadError, XmlLoadError} from '../../editor/xmlLib';
import {failure, myTry, Result, transformResult} from '../../functional/result';
import {AOWordContent} from './wordContent';

export interface AOFootNote {
  type: 'AONote';
  content: string;
  number: number;
}

function readNumberAttributeValue(v: string | null): Result<number, XmlLoadError[]> {
  return v
    ? myTry(() => parseInt(v), (s) => [xmlLoadError(s, [])])
    : failure([xmlLoadError('No value given!', [])]);
}

export const aoNoteFormat: XmlFormat<AOFootNote> = {
  read: (el) => transformResult(
    failableAttributeReader<number>(el, 'n', readNumberAttributeValue),
    (num) => aoNote(readAttribute(el, 'c', (v) => v || ''), num),
    (errors) => errors.flat()
  ),
  write: ({content, number}) => [`<note c="${content}" n="${number}"/>`]
};

export function aoNote(content: string, number = -1): AOFootNote {
  return {type: 'AONote', content, number};
}

export function isAoFootNote(c: AOWordContent): c is AOFootNote {
  return c.type === 'AONote';
}