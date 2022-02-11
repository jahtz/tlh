import {akkadogrammFormat, AOAkkadogramm, isAkkadogramm,} from './akkadogramm';
import {AOSumerogramm, isSumerogramm, sumerogrammFormat} from './sumerogramm';
import {AONumeralContent, isNumeralContent, numeralContentFormat} from './numeralContent';
import {AODeterminativ, determinativFormat, isDeterminativ} from './determinativ';
import {AOMaterLectionis, isMaterLectionis, materLectionisFormat} from './materLectionis';
import {AOCorr, aoCorrFormat, isCorrectionContent} from './corrections';
import {DamageContent, isDamageContent, xmlifyDamageContent} from './damages';
import {AOSign, aoSignFormat, isAoSign} from './sign';
import {AOFootNote, aoNoteFormat, isAoFootNote} from './footNote';
import {AOKolonMark, aoKolonMarkFormat, isAoKolonMark} from './kolonMark';
import {AOIllegibleContent} from './illegible';
import {AOSpace, aoSpaceFormat, isSpace} from './space';
import {XmlNode} from '../../editor/xmlModel/xmlModel';
import {XmlWriter} from '../../editor/xmlModel/xmlWriting';
import {InscribedLetter, inscribedLetterFormat, isInscribedLetter} from './inscribedLetter';
import {Ellipsis, ellipsisFormat, isEllipsis} from './ellipsis';
import {BasicText, isBasicText} from './basicText';
import {IndexDigit, isIndexDigit} from './indexDigit';

// Word content

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
  | Ellipsis
  | IndexDigit;

export type AOWordContent =
  AOSimpleWordContent
  | AOAkkadogramm
  | AOSumerogramm
  | AODeterminativ
  | AONumeralContent
  | AOIllegibleContent;

export function xmlifyAoWordContent(c: AOWordContent): XmlNode {
  if (isBasicText(c)) {
    return {textContent: c.content};
  } else if (isAkkadogramm(c)) {
    return {tagName: 'aGr', attributes: {}, children: c.contents.map(xmlifyAoWordContent)};
  } else if (isSumerogramm(c)) {
    return {tagName: 'sGr', attributes: {}, children: c.contents.map(xmlifyAoWordContent)};
  } else if (isDeterminativ(c)) {
    return {tagName: 'd', attributes: {}, children: c.content.map(xmlifyAoWordContent)};
  } else if (isCorrectionContent(c)) {
    return {tagName: 'corr', attributes: {c: c.c}, children: []};
  } else if (isSpace(c)) {
    return {tagName: 'space', attributes: {c: c.c}, children: []};
  } else if (isDamageContent(c)) {
    return {tagName: c.damageType, attributes: {}, children: []};
  } else if (isAoFootNote(c)) {
    return {tagName: 'note', attributes: {n: c.number.toString(), c: c.content}, children: []};
  }/* else if (isNumeralContent(c)) {
    return c.content;
  }*/
  else if (isIndexDigit(c)) {
    return {textContent: c.content.toString()};
  } else {
    // FIXME: implement rest!
    throw new Error('TODO: implement: ' + c.type + '!');
  }
}

export const aoWordContentFormat: XmlWriter<AOWordContent> = {
  write: (c) => {
    if (isBasicText(c)) {
      return [c.content];
    } else if (isAkkadogramm(c)) {
      return akkadogrammFormat.write(c);
    } else if (isSumerogramm(c)) {
      return sumerogrammFormat.write(c);
    } else if (isDeterminativ(c)) {
      return determinativFormat.write(c);
    } else if (isMaterLectionis(c)) {
      return materLectionisFormat.write(c);
    } else if (isNumeralContent(c)) {
      return numeralContentFormat.write(c);
    } else if (isCorrectionContent(c)) {
      return aoCorrFormat.write(c);
    } else if (isDamageContent(c)) {
      return xmlifyDamageContent(c);
    } else if (isAoSign(c)) {
      return aoSignFormat.write(c);
    } else if (isAoFootNote(c)) {
      return aoNoteFormat.write(c);
    } else if (isAoKolonMark(c)) {
      return aoKolonMarkFormat.write(c);
    } else if (isSpace(c)) {
      return aoSpaceFormat.write(c);
    } else if (isInscribedLetter(c)) {
      return inscribedLetterFormat.write(c);
    } else if (isEllipsis(c)) {
      return ellipsisFormat.write(c);
    } else {
      // Illegible content
      // let y = c;
      return ['x'];
    }
  }
};
