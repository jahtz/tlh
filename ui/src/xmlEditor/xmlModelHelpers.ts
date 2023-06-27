import {isXmlCommentNode, isXmlTextNode, XmlCommentNode, XmlElementNode, XmlNode, XmlTextNode} from 'simple_xml';

export function processElement<T>(node: XmlNode, commentFunc: (c: XmlCommentNode) => T, textFunc: (t: XmlTextNode) => T, elemFunc: (e: XmlElementNode) => T): T {
  if (isXmlCommentNode(node)) {
    return commentFunc(node);
  } else if (isXmlTextNode(node)) {
    return textFunc(node);
  } else {
    return elemFunc(node);
  }
}
