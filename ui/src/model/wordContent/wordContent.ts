import {AOAkkadogramm, convertAoAkkadogrammToXmlStrings, isAkkadogramm,} from './akkadogramm';
import {AOSumerogramm, convertAoSumerogrammToXmlStrings, isSumerogramm} from './sumerogramm';
import {AONumeralContent, convertAoNumeralContentToXmlStrings, isNumeralContent} from './numeralContent';
import {AODeterminativ, convertAoDeterminativToXmlStrings, isDeterminativ} from './determinativ';
import {AOMaterLectionis, convertAoMaterLectionisToXmlStrings, isMaterLectionis} from './materLectionis';
import {AOCorr, convertAoCorrToXmlStrings, isCorrectionContent} from './corrections';
import {DamageContent, isDamageContent, xmlifyDamageContent} from './damages';
import {AOSign, convertAoSignToXmlString, isAoSign} from './sign';
import {AOFootNote, convertAoFootNoteToXmlStrings, isAoFootNote} from './footNote';
import {AOKolonMark, convertAoKolonMarkToXmlStrings, isAoKolonMark} from './kolonMark';
import {AOIllegibleContent} from './illegible';
import {AOSpace, convertAoSpaceToXmlStrings, isSpace} from './space';
import {InscribedLetter, isInscribedLetter} from './inscribedLetter';
import {AOEllipsis, isEllipsis} from './ellipsis';
import {BasicText, isBasicText} from './basicText';
import {IndexDigit, isIndexDigit} from './indexDigit';
import {textNode, xmlElementNode, XmlNode} from '../../xmlModel/xmlModel';

// Word content

// FIXME: replace with xml nodes!?!
export type AOSimpleWordContent =
  AOCorr
  | DamageContent
  | InscribedLetter
  | BasicText
  | AOMaterLectionis
  | AOFootNote
  | AOSign
  | AOKolonMark
  | AOSpace
  | AOEllipsis
  | IndexDigit;

export type AOWordContent =
  AOSimpleWordContent
  | AOAkkadogramm
  | AOSumerogramm
  | AODeterminativ
  | AONumeralContent
  | AOIllegibleContent;

export function convertAoWordContentToXmlNode(c: AOWordContent): XmlNode {
  if (isBasicText(c)) {
    return textNode(c.content);
  } else if (isAkkadogramm(c)) {
    return xmlElementNode('aGr', {}, c.contents.map(convertAoWordContentToXmlNode));
  } else if (isSumerogramm(c)) {
    return xmlElementNode('sGr', {}, c.contents.map(convertAoWordContentToXmlNode));
  } else if (isDeterminativ(c)) {
    return xmlElementNode('d', {}, c.content.map(convertAoWordContentToXmlNode));
  } else if (isCorrectionContent(c)) {
    return xmlElementNode('corr', {c: c.c});
  } else if (isSpace(c)) {
    return xmlElementNode('space', {c: c.c});
  } else if (isDamageContent(c)) {
    return xmlElementNode(c.damageType);
  } else if (isAoFootNote(c)) {
    return xmlElementNode('note', {n: c.number.toString(), c: c.content});
  } else if (isIndexDigit(c)) {
    return textNode(c.content.toString());
  } else if (isNumeralContent(c)) {
    return textNode(c.content.toString());
  } else {
    // FIXME: implement rest!
    throw new Error('TODO: implement: ' + c.type + '!');
  }
}

export function convertAoWordToXmlString(c: AOWordContent): string[] {
  if (isBasicText(c)) {
    return [c.content];
  } else if (isAkkadogramm(c)) {
    return convertAoAkkadogrammToXmlStrings(c);
  } else if (isSumerogramm(c)) {
    return convertAoSumerogrammToXmlStrings(c);
  } else if (isDeterminativ(c)) {
    return convertAoDeterminativToXmlStrings(c);
  } else if (isMaterLectionis(c)) {
    return convertAoMaterLectionisToXmlStrings(c);
  } else if (isNumeralContent(c)) {
    return convertAoNumeralContentToXmlStrings(c);
  } else if (isCorrectionContent(c)) {
    return convertAoCorrToXmlStrings(c);
  } else if (isDamageContent(c)) {
    return xmlifyDamageContent(c);
  } else if (isAoSign(c)) {
    return convertAoSignToXmlString(c);
  } else if (isAoFootNote(c)) {
    return convertAoFootNoteToXmlStrings(c);
  } else if (isAoKolonMark(c)) {
    return convertAoKolonMarkToXmlStrings(c);
  } else if (isSpace(c)) {
    return convertAoSpaceToXmlStrings(c);
  } else if (isInscribedLetter(c)) {
    return ['x'];
  } else if (isEllipsis(c)) {
    return ['…'];
  } else {
    // Illegible content
    // let y = c;
    return ['x'];
  }
}
