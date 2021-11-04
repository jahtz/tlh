import {XmlNode} from './xmlModel';
import {loadNode, tlhXmlReadConfig, XmlReadConfig} from './xmlReading';

export async function loadNewXml(file: File, xmlReadConfig: XmlReadConfig = tlhXmlReadConfig): Promise<XmlNode> {
  const content = await file.text();

  // non breakable space to normal space
  const correctedText = content.replaceAll('\xa0', '');

  const doc = new DOMParser().parseFromString(correctedText, 'text/xml');

  return loadNode(doc.children[0], xmlReadConfig);
}
