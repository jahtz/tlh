import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from 'simple_xml';
import {collectNewResult, mapNewResult, newError, newOk, NewResult} from '../newResult';

export function reconstructTransliterationForWordNode({tagName, children}: XmlElementNode): NewResult<string, string> {
  if (tagName !== 'w') {
    return newError('only <w/>-Tags can be reconstructed!');
  }

  return convertChildren(children);
}

const convertChildren = (children: XmlNode[]): NewResult<string, string> => collectNewResult(
  children.map((node): NewResult<string, string> => reconstructTransliterationFromNode(node)),
  (acc, t) => acc + t,
  ''
);

function reconstructTransliterationFromNode(node: XmlNode): NewResult<string, string> {
  if (isXmlCommentNode(node)) {
    return newOk('');
  }

  if (isXmlTextNode(node)) {
    return newOk(node.textContent);
  }

  switch (node.tagName) {
    case 'add_in':
      return newOk('〈');
    case 'add_fin':
      return newOk('〉');
    case 'del_in':
      return newOk('[');
    case 'del_fin':
      return newOk(']');
    case 'laes_in':
      return newOk('⸢');
    case 'laes_fin':
      return newOk('⸣');
    case 'ras_in':
    case 'ras_fin':
      return newOk('*');
    case 'parsep':
      return newOk('§');
    case 'parsep_dbl':
      return newOk('§§');
    case 'space':
      return newOk(' '.repeat(parseInt(node.attributes.c || '0')));
    case 'materlect':
      return newOk(`°${node.attributes.c}°`);
    case 'corr':
      return newOk(node.attributes.c || '');
    case 'note':
      return newOk(`{F: ${node.attributes.c}}`);
    case 'subscr':
      return newOk(`|${node.attributes.c}`);
    case 'surpl':
      return newOk(`〈〈${node.attributes.c}}〉〉`);
    case 'num':
      return convertChildren(node.children);
    case 'sGr':
      return convertChildren(node.children);
    case 'aGr':
      return mapNewResult(
        convertChildren(node.children),
        (innerContent) => innerContent.startsWith('-') || innerContent.startsWith('+') ? innerContent : '_' + innerContent);
    case 'd':
      return mapNewResult(convertChildren(node.children), (innerContent) => `°${innerContent}°`);
    default:
      return newError(`tagName ${node.tagName} is not yet supported!`);
  }
}
