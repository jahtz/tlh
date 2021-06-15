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
import {XmlWriter} from '../../editor/xmlModel';
import {InscribedLetter, inscribedLetterFormat, isInscribedLetter} from './inscribedLetter';
import {Ellipsis, ellipsisFormat, isEllipsis} from './ellipsis';
import {BasicText, isBasicText} from './basicText';
import {IndexDigit} from './indexDigit';

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

export function getContent(c: AOWordContent): string {
  if (isBasicText(c)) {
    return c.content;
  } else if (isAkkadogramm(c)) {
    return c.contents.map(getContent).join('');
  } else if (isSumerogramm(c)) {
    return c.contents.map(getContent).join('');
  } else if (isNumeralContent(c)) {
    return c.content.map(getContent).join('');
  } else if (isDeterminativ(c)) {
    return c.content.map(getContent).join('');
  } else if (isMaterLectionis(c)) {
    return c.content;
  } else {
    // FIXME: implement?!
    return '';
  }
}
