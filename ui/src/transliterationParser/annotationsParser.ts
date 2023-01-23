import {xmlElementNode, XmlElementNode, xmlTextNode} from '../xmlModel/xmlModel';
import {Parser, regexp} from 'parsimmon';

// Footnote

export type FootNote = XmlElementNode<'note'>;

export const aoFootNote = (c: string, n = '') => xmlElementNode('note', {c, n});

export const footNoteParser: Parser<FootNote> = regexp(/{F:\s*([^}]*)}/, 1).map(aoFootNote);

// Gap

export type Gap = XmlElementNode<'gap'>;

export const aoGapNode = (content: string) => xmlElementNode('gap', {}, [xmlTextNode(content)]);

export const gapParser: Parser<Gap> = regexp(/{G:\s*([^}]*)}/, 1).map(aoGapNode);


// KolonMark

export type KolonMark = XmlElementNode<'AOKolonMark'>;

export const aoKolonMark = (content: string) => xmlElementNode('AOKolonMark', {}, [xmlTextNode(content)]);

export const kolonMarkParser: Parser<KolonMark> = regexp(/{K:\s*([^}]*)}/, 1).map(aoKolonMark);

// Sign

export type Sign = XmlElementNode<'AO:Sign'>;

export const aoSign = (content: string) => xmlElementNode('AO:Sign', {}, [xmlTextNode(content)]);

export const signParser: Parser<Sign> = regexp(/{S:\s*([^}]*)}/, 1).map(aoSign);
