import {loadNode, XmlNode} from './xmlModel';

export async function loadNewXml(file: File): Promise<XmlNode> {
  const content = await file.text();

  const doc = new DOMParser().parseFromString(content, 'text/xml');

  return loadNode(doc.children[0]);
}
