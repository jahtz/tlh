import {xmlElementNode, XmlNonEmptyNode, xmlTextNode} from '../xmlModel/xmlModel';

export const aoEllipsis = xmlTextNode('…');

export const aoIllegibleContent = xmlTextNode('x');

export const aoBasicText = (content: string) => xmlTextNode(content);

export const indexDigit = (content: string) => xmlTextNode(content);

export const inscribedLetter = (content: string) => xmlTextNode(content);

export const numeralContent = (content: string) => xmlTextNode(content);


export const del_in = xmlElementNode('del_in');
export const del_fin = xmlElementNode('del_fin');

export const laes_in = xmlElementNode('laes_in');
export const laes_fin = xmlElementNode('laes_fin');

export const ras_in = xmlElementNode('ras_in');
export const ras_fin = xmlElementNode('ras_fin');


export const aoCorr = (c: string) => xmlElementNode('corr', {c});

// export const aoSpace = (c: string) => xmlElementNode('space', {c});

export const aoFootNote = (c: string, n = '') => xmlElementNode('note', {c, n});


export const aoKolonMark = (content: string) => xmlElementNode('AOKolonMark', {}, [xmlTextNode(content)]);

export const materLectionis = (content: string) => xmlElementNode('AOMaterLectionis', {}, [aoBasicText(content)]);

export const aoSign = (content: string) => xmlElementNode('AO:Sign', {}, [xmlTextNode(content)]);


function clearUpperMultiStringContent(c: XmlNonEmptyNode | string): XmlNonEmptyNode {
  return typeof c === 'string' ? xmlTextNode(c) : c;
}


export const akkadogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('aGr', {}, contents.map(clearUpperMultiStringContent));

export const sumerogramm = (...contents: (XmlNonEmptyNode | string)[]) => xmlElementNode('sGr', {}, contents.map(clearUpperMultiStringContent));

export const determinativ = (...content: (XmlNonEmptyNode | string)[]) => xmlElementNode('det', {}, content.map(clearUpperMultiStringContent));
