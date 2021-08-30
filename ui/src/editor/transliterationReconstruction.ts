import {isXmlTextNode, XmlNode} from './xmlModel/xmlModel';

export function reconstructTransliteration(node: XmlNode, isFirstChild = false): string {
  if (isXmlTextNode(node)) {
    return node.textContent;
  }

  const innerContent = node.children.map((c) => reconstructTransliteration(c)).join('');

  switch (node.tagName) {
  case 'aGr':
    return (isFirstChild ? '_' : '--') + innerContent;
  case 'sGr':
    return (isFirstChild ? '' : '-') + innerContent;
  case 'd':
    return '°' + innerContent + '°';
  case 'del_in':
    return '[';
  case 'del_fin':
    return ']';
  case 'laes_in':
    return '⸢';
  case 'laes_fin':
    return '⸣';
  case 'num':
    return innerContent;
  default:
    console.info(JSON.stringify(node));
    return 'XXX';
  }
}