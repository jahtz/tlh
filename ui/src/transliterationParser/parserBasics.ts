import {Parser, regexp} from 'parsimmon';
import {SuccessfulTestData} from './wordParser.spec';
import {XmlNonEmptyNode, xmlTextNode} from '../xmlModel/xmlModel';

export const lowerText: Parser<string> = regexp(/[a-wyzáàéèíìúùṭṣšḫ]+/u);

export const upperText: Parser<string> = regexp(/\p{Lu}+/u);

export function clearUpperMultiStringContent(c: XmlNonEmptyNode | string): XmlNonEmptyNode {
  return typeof c === 'string' ? xmlTextNode(c) : c;
}

export function testParser<T>(name: string, parser: Parser<T>, cases: readonly SuccessfulTestData<T>[]) {
  return test.each(cases)(
    `parser "${name}" should parse "$source" as $awaitedResult`,
    ({source, awaitedResult}) => expect(parser.tryParse(source)).toEqual<T>(awaitedResult)
  );
}
