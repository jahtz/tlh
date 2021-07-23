import {XmlNode} from './xmlModel';

export function reconstructTransliteration(node: XmlNode): string {
  if (node.__type === 'XmlTextNode') {
    return node.textContent;
  }

  const innerContent = node.children.map(reconstructTransliteration).join('');

  switch (node.tagName) {
  case 'aGr':
    return '_' + innerContent;
  case 'sGr':
    return innerContent;
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