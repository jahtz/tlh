import {attributeReader, failableAttributeReader, XmlFormat} from "../../editor/xmlLib";
import {failure, myTry, Result} from '../../functional/result';
import {AOWordContent} from "./wordContent";

export interface AOFootNote {
  type: 'AONote';
  content: string;
  number: number;
}

function readNumberAttributeValue(v: string | null): Result<number, string[]> {
  return v ? myTry(() => parseInt(v), (s) => [s]) : failure(['No value given!']);
}

export const aoNoteFormat: XmlFormat<AOFootNote> = {
  read: (el) =>
    failableAttributeReader<number>(el, 'n', readNumberAttributeValue)
      .map((num) => aoNote(attributeReader(el, 'c', (v) => v || ''), num)),
  write: ({content, number}) => [`<note c="${content}" n="${number}"/>`]
}

export function aoNote(content: string, number: number = -1): AOFootNote {
  return {type: 'AONote', content, number};
}

export function isAoFootNote(c: AOWordContent): c is AOFootNote {
  return c.type === 'AONote';
}