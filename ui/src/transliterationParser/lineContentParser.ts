import {alt, Failure, Result as ParsimmonResult, string} from 'parsimmon';
import {XmlElementNode, xmlTextNode} from '../xmlModel/xmlModel';
import {ParagraphSeparatorNode, paragraphSeparatorParser} from './paragraphSeparatorParser';
import {parsedWord, wordParser} from './wordParser';

// Other

function partitionResults<T>(ts: ParsimmonResult<T>[]): [T[], Failure[]] {
  return ts.reduce<[T[], Failure[]]>(
    ([ss, fs], t) =>
      t.status
        ? [[...ss, t.value], fs] as [T[], Failure[]]
        : [ss, [...fs, t]] as [T[], Failure []],
    [[], []]
  );
}

const spaceNotInAccoladesRegex = /\s+(?![^{]*})/;

interface ContentParseError {
  type: 'ContentParseError';
  errors: Failure[];
}

interface ContentParseSuccess {
  type: 'ContentParseSuccess';
  words: XmlElementNode<'w'>[];
  maybeParagraphSeparator: ParagraphSeparatorNode | undefined;
}

export type ContentParseResult = ContentParseError | ContentParseSuccess;

const lineContentParser = alt(
  string('x').result([xmlTextNode('x')]),
  wordParser
).map((x) => parsedWord(...x));

export function parseTransliterationLineContent(content: string): ContentParseResult {
  // split by spaces not in accolades to get single contents (word, parsep or parsep_dbl)
  const stringContents: string[] = content.split(spaceNotInAccoladesRegex);

  if (stringContents.length === 0) {
    // no words or other content in line
    return {type: 'ContentParseSuccess', words: [], maybeParagraphSeparator: undefined};
  }

  // check last element for special processing (paragraphSeparator)
  const lastContentParSepParseResult = paragraphSeparatorParser.parse(stringContents[stringContents.length - 1].trim());

  const [wordContents, maybeParagraphSeparator] = lastContentParSepParseResult.status
    ? [stringContents.slice(0, stringContents.length - 1), lastContentParSepParseResult.value]
    : [stringContents, undefined];

  const wordResults = wordContents.map((input) => lineContentParser.parse(input));

  const [words, errors] = partitionResults(wordResults);

  return errors.length > 0
    ? {type: 'ContentParseError', errors}
    : {type: 'ContentParseSuccess', words, maybeParagraphSeparator};
}


