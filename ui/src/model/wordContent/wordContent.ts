import {akkadogrammFormat, AOAkkadogramm, isAkkadogramm,} from "./akkadogramm";
import {AOSumerogramm, isSumerogramm, sumerogrammFormat} from "./sumerogramm";
import {AONumeralContent, isNumeralContent, numeralContentFormat} from "./numeralContent";
import {AODeterminativ, determinativFormat, isDeterminativ} from "./determinativ";
import {AOMaterLectionis, isMaterLectionis, materLectionisFormat} from "./materLectionis";
import {AOCorr, aoCorrFormat, isCorrectionContent} from "./corrections";
import {
  damageContent,
  DamageContent,
  deletionEndFormat,
  deletionStartFormat,
  isDamageContent,
  lesionEndFormat,
  lesionStartFormat,
  rasureEndFormat,
  rasureStartFormat,
  xmlifyDamageContent
} from "./damages";
import {AOSign, aoSignFormat, isAoSign} from "./sign";
import {AOFootNote, aoNoteFormat, isAoFootNote} from "./footNote";
import {AOKolonMark, aoKolonMarkFormat, isAoKolonMark} from "./kolonMark";
import {AOIllegibleContent} from "./illegible";
import {AOSpace, aoSpaceFormat, isSpace} from "./space";
import {XmlFormat} from "../../editor/xmlLib";
import {InscribedLetter, inscribedLetterFormat, isInscribedLetter} from "./inscribedLetter";
import {Ellipsis, ellipsisFormat, isEllipsis} from "./ellipsis";
import {BasicText, isBasicText} from "./basicText";
import {failure} from "../../functional/result";
import {IndexDigit} from "./indexDigit";

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

export const aoWordContentFormat: XmlFormat<AOWordContent> = {
  read: (el) => {
    switch (el.tagName) {
      case 'del_in':
        return deletionStartFormat.read(el).map(damageContent);
      case 'del_fin':
        return deletionEndFormat.read(el).map(damageContent);
      case 'ras_in':
        return rasureStartFormat.read(el).map(damageContent);
      case 'ras_fin':
        return rasureEndFormat.read(el).map(damageContent);
      case 'laes_in':
        return lesionStartFormat.read(el).map(damageContent);
      case 'laes_fin':
        return lesionEndFormat.read(el).map(damageContent);
      case 'sGr':
        return sumerogrammFormat.read(el);
      case 'aGr':
        return akkadogrammFormat.read(el);
      case 'd':
        return determinativFormat.read(el);
      case 'SP___AO_3a_MaterLect':
        return materLectionisFormat.read(el);
      case 'num':
        return numeralContentFormat.read(el);
      case 'space':
        return aoSpaceFormat.read(el);
      case 'corr':
        return aoCorrFormat.read(el);
      case 'SP___AO_3a_-KolonMark':
        return aoKolonMarkFormat.read(el);
      case 'AO:Sign':
        return aoSignFormat.read(el);
      case 'note':
        return aoNoteFormat.read(el);
      default:
        return failure([`Illegal tag name ${el.tagName} found!`])
    }
  },
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
