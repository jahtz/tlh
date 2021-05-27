import {AOBody, aoBodyFormat} from "./documentBody";
import {AOHeader, aoHeaderFormat} from "./documentHeader";
import {childElementReader, indent, XmlFormat} from "./xmlLib";
import {zipResult} from "../functional/result";

interface GenericAttribute {
  name: string;
  value: string;
}

function genericAttribute(name: string, value: string): GenericAttribute {
  return {name, value};
}

function extractGenericAttributes(el: Element): GenericAttribute[] {
  return Array.from(el.attributes).map(({name, value}) => genericAttribute(name, value))
}

// AOXml

export interface AOXml {
  type: 'AOXml',
  attributes: GenericAttribute[];
  aoHeader: AOHeader;
  body: AOBody;
}

export const aoXmlFormat: XmlFormat<AOXml> = {
  read: (el) => zipResult(
    childElementReader(el, 'AOHeader', aoHeaderFormat),
    childElementReader(el, 'body', aoBodyFormat)
  ).transformContent(
    ([header, body]) => aoXml(extractGenericAttributes(el), header, body),
    (errs) => errs.flat()
  ),
  write: ({attributes, aoHeader, body}) => [
    '<?xml-stylesheet href="HPMxml.css" type="text/css"?>',
    `<!DOCTYPE AOxml SYSTEM "annot.dtd">`,
    '<AOxml',
    ...attributes.map(({name, value}) => `${name}="${value}"`).map(indent),
    '>',
    ...aoHeaderFormat.write(aoHeader).map(indent),
    ...aoBodyFormat.write(body).map(indent),
    '</AOxml>'
  ]
}

function aoXml(attributes: GenericAttribute[], aoHeader: AOHeader, body: AOBody): AOXml {
  return {type: 'AOXml', attributes, aoHeader, body}
}
