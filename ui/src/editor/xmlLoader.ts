import {AOXml, aoXmlFormat} from './document';
import {Result} from "../functional/result";
import {XmlLoadError} from "./xmlLib";

// Document elements

async function readDocumentFile(file: File): Promise<string> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => resolve(fileReader.result as string);

    fileReader.onerror = reject;

    fileReader.readAsText(file);
  });
}

export async function loadXml(file: File): Promise<Result<AOXml, XmlLoadError[]>> {
  const content = await readDocumentFile(file);

  const doc = new DOMParser().parseFromString(content, 'text/xml');

  const aoXmlNode: Element = doc.getElementsByTagName('AOxml')[0];

  return aoXmlFormat.read(aoXmlNode);
}
