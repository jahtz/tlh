import {Attributes, xmlElementNode, XmlElementNode, XmlNode, xmlTextNode} from 'simple_xml';
import {ManuscriptIdentifierType} from '../../graphql';

const defaultAoXmlAttributes: Attributes = {
  'xmlns:hpm': 'http://hethiter.net/ns/hpm/1.0',
  'xmlns:AO': 'http://hethiter.net/ns/AO/1.0',
  'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
  'xmlns:xlink': 'http://www.w3.org/1999/xlink',
  'xmlns:meta': 'urn:oasis:names:tc:opendocument:xmlns:meta:1.0',
  'xmlns:text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  'xmlns:table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  'xmlns:draw': 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
  'xml:space': 'preserve'
};

const manuscriptIdentifierTag = (identifierType: ManuscriptIdentifierType): string => ({
  [ManuscriptIdentifierType.CollectionNumber]: 'AO:InvNr',
  [ManuscriptIdentifierType.PublicationShortReference]: 'AO:TxtPubl',
  [ManuscriptIdentifierType.ExcavationNumber]: 'AO:ExcNr'
}[identifierType]);

export interface XmlCreationValues {
  mainIdentifier: string;
  mainIdentifierType: ManuscriptIdentifierType;
  author: string;
  creationDate: string;
  transliterationReleaseDate: string | null | undefined;
}

export function createCompleteDocument(documentContent: XmlNode[], xmlCreationValues: XmlCreationValues): XmlElementNode {
  const {mainIdentifier, mainIdentifierType, author, creationDate, transliterationReleaseDate} = xmlCreationValues;

  const transliterationReleaseNode = transliterationReleaseDate
    ? [xmlElementNode('creation-date', {date: transliterationReleaseDate})]
    : [];

  return xmlElementNode('AOxml', defaultAoXmlAttributes, [
    xmlElementNode('AOHeader', {}, [
      xmlElementNode('docID', {}, [xmlTextNode(mainIdentifier)]),
      xmlElementNode('meta', {}, [
        xmlElementNode('author', {author, date: creationDate}),
        ...transliterationReleaseNode
      ])
    ]),
    xmlElementNode('body', {}, [
      xmlElementNode('div1', {type: 'transliteration'}, [
        xmlElementNode('AO:Manuscripts', {}, [
          xmlElementNode(manuscriptIdentifierTag(mainIdentifierType), {}, [xmlTextNode(mainIdentifier)])
        ]),
        xmlElementNode('text', {},
          documentContent
        )
      ])
    ])
  ]);
}