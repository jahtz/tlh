import {testParser} from './parserBasics';
import {paragraphSeparatorDoubleXmlNode, ParagraphSeparatorNode, paragraphSeparatorParser, paragraphSeparatorXmlNode} from './paragraphSeparatorParser';

describe('paragraphSeparatorParser', () => testParser<ParagraphSeparatorNode>('paragraphSeparatorParser', paragraphSeparatorParser, [
  {source: '§', awaitedResult: paragraphSeparatorXmlNode},
  {source: '¬¬¬', awaitedResult: paragraphSeparatorXmlNode},
  {source: '§§', awaitedResult: paragraphSeparatorDoubleXmlNode},
  {source: '===', awaitedResult: paragraphSeparatorDoubleXmlNode}
]));