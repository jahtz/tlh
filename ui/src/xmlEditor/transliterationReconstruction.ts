import {isXmlCommentNode, isXmlTextNode, XmlElementNode, XmlNode} from 'simple_xml';

export function reconstructTransliterationForWordNode({tagName, children}: XmlElementNode): string {
  if (tagName !== 'w') {
    throw new Error('only <w/>-Tags can be reconstructed!');
  }

  return convertChildren(children);
}

const convertChildren = (children: XmlNode[]): string => children.map((node) => reconstructTransliterationFromNode(node)).join('');

function reconstructTransliterationFromNode(node: XmlNode): string {
  if (isXmlCommentNode(node)) {
    return '';
  }

  if (isXmlTextNode(node)) {
    return node.textContent;
  }

  const innerContent = convertChildren(node.children);

  switch (node.tagName) {
  case 'del_in':
    return '[';
  case 'del_fin':
    return ']';
  case 'laes_in':
    return '⸢';
  case 'laes_fin':
    return '⸣';
  case 'ras_in':
  case 'ras_fin':
    return '*';
  case 'parsep':
    return '§';
  case 'parsep_dbl':
    return '§§';
  case 'space':
    return ' '.repeat(parseInt(node.attributes.c || '0'));
  case 'aGr':
    return innerContent.startsWith('-') || innerContent.startsWith('+')
      ? innerContent
      : '_' + innerContent;
  case 'sGr':
    return /*(isFirstChild ? '' : '-') +*/ innerContent;
  case 'd':
    return `°${innerContent}°`;
  case 'materlect':
    return `°${node.attributes.c}°`;
  case 'num':
    return innerContent;
  case 'corr':
    return node.attributes.c || '';
  case 'note':
    return `{F: ${node.attributes.c}}`;
  case 'subscr':
    return `|${node.attributes.c}`;
  default:
    throw new Error(`tagName ${node.tagName} is not yet supported!`);
  }
}
