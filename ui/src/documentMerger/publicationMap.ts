import {isXmlElementNode, isXmlTextNode, XmlElementNode, xmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';

// type: oldFragmentNumber -> [newFragmentNumber, identifier]
export type PublicationMap = Map<string, [number, string]>;

export function writePublicationMapping(publicationMap: PublicationMap): XmlElementNode {
  const publications: XmlNode[] = [];

  Array.from(publicationMap.values())
    .forEach((publication, index) => {
      if (index > 0) {
        publications.push(xmlTextNode('+'));
      }

      // FIXME: move to new format!
      publications.push(
        xmlElementNode('AO:TxtPubl', {}, [
          xmlTextNode(`${publication[1]} {€${publication[0]}}`.replaceAll(/[\n\t/]/, ''))
        ])
      );
    });

  return xmlElementNode('AO:Manuscripts', {}, publications);
}

export const getPublicationMappingString = (aoManuscriptsNode: XmlElementNode): string[] => aoManuscriptsNode.children.flatMap((childPub) => {
  if (isXmlTextNode(childPub)) {
    return [childPub.textContent];
  } else if (isXmlElementNode(childPub) && isXmlTextNode(childPub.children[0])) {
    return [childPub.children[0].textContent];
  } else {
    return [];
  }
});
