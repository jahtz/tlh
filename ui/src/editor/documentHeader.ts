import {childElementReader, indent, readAttribute, XmlFormat,} from "./xmlLib";
import {flattenResults, success, transformResult, zipResult} from "../functional/result";

// AOHeader

export interface AOHeader {
  type: 'AOHeader';
  docId: AODocID;
  meta: AOMeta;
}

export const aoHeaderFormat: XmlFormat<AOHeader> = {
  read: (el) => transformResult(
    zipResult(
      childElementReader(el, 'docID', aoDocIdFormat),
      childElementReader(el, 'meta', aoMetaFormat)
    ),
    ([docId, meta]) => aoHeader(docId, meta),
    (errs) => errs.flat()
  ),
  write: ({docId, meta}) => [
    '<AOHeader>',
    ...aoDocIdFormat.write(docId).map(indent),
    ...aoMetaFormat.write(meta).map(indent),
    '</AOHeader>'
  ]
};

function aoHeader(docId: AODocID, meta: AOMeta): AOHeader {
  return {type: 'AOHeader', docId, meta};
}

// AODocId

export interface AODocID {
  type: 'AODocId';
  content: string;
}

const aoDocIdFormat: XmlFormat<AODocID> = {
  read: (el) => success(aoDocId(el.textContent || '')),
  write: ({content}) => [`<docID>${content}</docID>`]
};

function aoDocId(content: string): AODocID {
  return {type: 'AODocId', content};
}

// AOMeta

export interface AOMeta {
  type: 'AOMeta';
  creationDate: DatedAttributeElement;
  kor2: DatedAttributeElement;
  aoXmlCreation: DatedAttributeElement;
  annotation: AOAnnotation;
}

const aoMetaFormat: XmlFormat<AOMeta> = {
  read: (el: Element) => transformResult(
    zipResult(
      zipResult(
        childElementReader(el, 'creation-date', datedStringElementFormat),
        childElementReader(el, 'kor2', datedStringElementFormat)
      ),
      zipResult(
        childElementReader(el, 'AOxml-creation', datedStringElementFormat),
        childElementReader(el, 'annotation', aoAnnotationFormat)
      ),
    ),
    ([[cd, kor2], [xmlCreation, annotation]]) => aoMeta(cd, kor2, xmlCreation, annotation),
    (errs) => errs.flat().flat()
  ),
  write: ({creationDate, kor2, aoXmlCreation, annotation}) => [
    '<meta>',
    indent(`<creation-date date="${creationDate.date}"/>`),
    indent(`<kor2 date="${kor2.date}"/>`),
    indent(`<AOxml-creation date="${aoXmlCreation.date}"/>`),
    ...aoAnnotationFormat.write(annotation).map(indent),
    '</meta>'
  ]
}

function aoMeta(creationDate: DatedAttributeElement, kor2: DatedAttributeElement, aoXmlCreation: DatedAttributeElement, annotation: AOAnnotation): AOMeta {
  return {type: 'AOMeta', creationDate, kor2, aoXmlCreation, annotation};
}

// AOAnnotation

export interface AOAnnotation {
  type: 'AOAnnotation';
  content: AOAnnot[];
}

const aoAnnotationFormat: XmlFormat<AOAnnotation> = {
  read: (el) => transformResult(
    flattenResults(
      Array.from(el.children).map((el) => aoAnnotFormat.read(el))
    ),
    (annots) => aoAnnotation(annots),
    (errs) => errs.flat()
  ),
  write: ({content}) => [
    '<annotation>',
    ...content.flatMap(aoAnnotFormat.write).map(indent),
    '</annotation>'
  ]
};

function aoAnnotation(content: AOAnnot[]): AOAnnotation {
  return {type: 'AOAnnotation', content};
}

// AOAnnot

export interface AOAnnot extends DatedAttributeElement {
  type: 'AOAnnot';
  editor: string;
}

const aoAnnotFormat: XmlFormat<AOAnnot> = {
  read: (el) => success(
    aoAnnot(
      el.getAttribute('date') || '',
      el.getAttribute('editor') || ''
    )
  ),
  write: ({date, editor}) => [`<annot editor="${editor}" date="${date}"/>`]
};

function aoAnnot(date: string, editor: string): AOAnnot {
  return {type: 'AOAnnot', date, editor};
}

// Dated Attribute Element

export interface DatedAttributeElement {
  date: string;
}

function datedAttributeElement(date: string): DatedAttributeElement {
  return {date};
}

const datedStringElementFormat: XmlFormat<DatedAttributeElement> = {
  read: (el) => success(datedAttributeElement(readAttribute(el, 'date', (v) => v || ''))),
  write: ({date}) => []
}
