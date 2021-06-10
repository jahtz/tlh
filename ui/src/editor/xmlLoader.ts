import {loadNode, XmlNode} from './xmlModel';

// Document elements

async function readDocumentFile(file: File): Promise<string> {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onloadend = () => resolve(fileReader.result as string);

    fileReader.onerror = reject;

    fileReader.readAsText(file);
  });
}

export async function loadNewXml(file: File): Promise<XmlNode> {
  const content = await readDocumentFile(file);

  const doc = new DOMParser().parseFromString(content, 'text/xml');

  return loadNode(doc.children[0]);
}
