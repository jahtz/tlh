import {paragraphSeparatorDoubleXmlNode, ParagraphSeparatorNode, paragraphSeparatorXmlNode} from '../model/sentenceContent/linebreak';
import {alt, Parser, string} from 'parsimmon';

export const paragraphSeparatorParser: Parser<ParagraphSeparatorNode> = alt(
  alt(string('§§'), string('===')).result(paragraphSeparatorDoubleXmlNode),
  alt(string('§').notFollowedBy(string('§')), string('¬¬¬')).result(paragraphSeparatorXmlNode),
);