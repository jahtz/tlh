import {failure, Result} from "../functional/result";

export interface XmlReader<T> {
  read: (el: Element) => Result<T, string[]>;
}

export interface XmlWriter<T> {
  write: (t: T) => string[];
}

export interface XmlFormat<T> extends XmlReader<T>, XmlWriter<T> {
}

export function attributeReader<T>(el: Element, name: string, f: (v: string | null) => T): T {
  return f(el.getAttribute(name));
}

export function failableAttributeReader<T>(el: Element, name: string, f: (v: string | null) => Result<T, string[]>): Result<T, string[]> {
  return f(el.getAttribute(name));
}

export function childElementReader<T>(el: Element, tagName: string, childElementFormat: XmlFormat<T>): Result<T, string[]> {
  const elements = el.getElementsByTagName(tagName);

  return elements.length === 0
    ? failure([`No child element with tag name ${tagName} found!`])
    : childElementFormat.read(elements[0]);
}

export function indent(s: string): string {
  return " ".repeat(2) + s;
}

/*
interface UnionElementConfig<T> {
  name: string;
  reader: XmlReader<T>;
}

export function unionElementReader<T>(options: UnionElementConfig<T>[]): XmlReader<T> {
  return {
    read: (el) => {
      const parsedElements: Success<T>[] = options
        .filter(({name}) => name === el.tagName)
        .map(({reader}) => reader.read(el))
        .filter(isSuccess);

      return parsedElements.length > 0 ? parsedElements[0] : failure([`Illegal tag name ${el.tagName} found!`])
    }
  }
}
*/