import {paragraphSeparatorParser} from './paragraphSeparatorParser';
import {paragraphSeparatorDoubleXmlNode, ParagraphSeparatorNode, paragraphSeparatorXmlNode} from '../model/sentenceContent/linebreak';
import {testParser} from './parserBasics';

describe('paragraphSeparatorParser', () => testParser<ParagraphSeparatorNode>('paragraphSeparatorParser', paragraphSeparatorParser, [
  {source: '§', awaitedResult: paragraphSeparatorXmlNode},
  {source: '¬¬¬', awaitedResult: paragraphSeparatorXmlNode},
  {source: '§§', awaitedResult: paragraphSeparatorDoubleXmlNode},
  {source: '===', awaitedResult: paragraphSeparatorDoubleXmlNode}
]));