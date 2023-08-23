import {XmlElementNode, XmlNode} from 'simple_xml';
import {processElement} from './xmlModelHelpers';

export interface TransliterationReconstruction {
  reconstruction: string;
  warnings: string[];
}

const emptyTransliterationReconstruction: TransliterationReconstruction = {reconstruction: '', warnings: []};

function recon(reconstruction: string): TransliterationReconstruction {
  return {reconstruction, warnings: []};
}

function joinReconstructions(
  {reconstruction: r1, warnings: w1}: TransliterationReconstruction,
  {reconstruction: r2, warnings: w2}: TransliterationReconstruction
): TransliterationReconstruction {
  return {reconstruction: r1 + r2, warnings: [...w1, ...w2]};
}

function mapReconstruction({reconstruction, warnings}: TransliterationReconstruction, f: (s: string) => string): TransliterationReconstruction {
  return {reconstruction: f(reconstruction), warnings};
}

export const reconstructTransliterationForWordNode = ({children}: XmlElementNode<'w'>): TransliterationReconstruction => convertChildren(children);

const convertChildren = (children: XmlNode[]): TransliterationReconstruction => children
  .map((node) => reconstructTransliterationFromNode(node))
  .reduce(joinReconstructions, emptyTransliterationReconstruction);

const reconstructTransliterationFromNode = (node: XmlNode): TransliterationReconstruction => processElement(node,
  () => recon(''),
  ({textContent}) => recon(textContent),
  (elementNode) => reconstructTransliterationFromElementNode(elementNode)
);

function reconstructTransliterationFromElementNode(node: XmlElementNode): TransliterationReconstruction {
  switch (node.tagName) {
    case 'lb':
      return recon('\n');
    case 'add_in':
      return recon('〈');
    case 'add_fin':
      return recon('〉');
    case 'del_in':
      return recon('[');
    case 'del_fin':
      return recon(']');
    case 'laes_in':
      return recon('⸢');
    case 'laes_fin':
      return recon('⸣');
    case 'ras_in':
    case 'ras_fin':
      return recon('*');
    case 'parsep':
      return recon('§');
    case 'parsep_dbl':
      return recon('§§');
    case 'space':
      return recon(' '.repeat(parseInt(node.attributes.c || '0')));
    case 'materlect':
      return recon(`°${node.attributes.c}°`);
    case 'corr':
      return recon(node.attributes.c || '');
    case 'note':
      return recon(`{F: ${node.attributes.c}}`);
    case 'subscr':
      return recon(`|${node.attributes.c}`);
    case 'surpl':
      return recon(`〈〈${node.attributes.c}〉〉`);
    case 'num':
      return convertChildren(node.children);
    case 'sGr':
      return convertChildren(node.children);
    case 'aGr':
      return mapReconstruction(convertChildren(node.children), (innerContent) => innerContent.startsWith('-') || innerContent.startsWith('+') ? innerContent : '_' + innerContent);
    case 'd':
      return mapReconstruction(convertChildren(node.children), (innerContent) => `°${innerContent}°`);
    default:
      return {reconstruction: '_?_', warnings: [(`tagName ${node.tagName} is not yet supported!`)]};
  }
}