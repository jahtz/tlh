import {failure, Result} from "../functional/result";

export interface XmlLoadError {
  message: string;
  path: string[];
}

export function xmlLoadError(message: string, path: string[]): XmlLoadError {
  return {message, path};
}

export interface XmlReader<T> {
  read: (el: Element) => Result<T, XmlLoadError[]>;
}

export interface XmlWriter<T> {
  write: (t: T) => string[];
}

export interface XmlFormat<T> extends XmlReader<T>, XmlWriter<T> {
}

export function readAttribute<T>(el: Element, name: string, f: (v: string | null) => T): T {
  return f(el.getAttribute(name));
}

export function failableAttributeReader<T>(el: Element, name: string, f: (v: string | null) => Result<T, XmlLoadError[]>): Result<T, XmlLoadError[]> {
  return f(el.getAttribute(name));
}

export function childElementReader<T>(el: Element, tagName: string, childElementFormat: XmlFormat<T>): Result<T, XmlLoadError[]> {
  const elements = el.getElementsByTagName(tagName);

  return elements.length === 0
    ? failure([xmlLoadError(`No child element with tag name ${tagName} found!`, [el.tagName, tagName])])
    : childElementFormat.read(elements[0]);
}

export function indent(s: string): string {
  return " ".repeat(2) + s;
}