import {parseNewXml, ParseResult} from './xmlReading';
import {emptyNode, textNode, XmlElementNode} from './xmlModel';

describe('xmlReader', () => {
  const x = '<w trans="%-nan~" mrp0sel="DEL"><del_fin/>x-<laes_in/>na-an<laes_fin/>-<del_in/></w>';
  const parsedX: XmlElementNode = {
    tagName: 'w',
    attributes: {trans: '%-nan~', mrp0sel: 'DEL'},
    children: [
      emptyNode('del_fin'), textNode('x-'), emptyNode('laes_in'), textNode('na-an'), emptyNode('laes_fin'), textNode('-'), emptyNode('del_in')
    ]
  };

  test.each<{ toParse: string, expected: ParseResult }>([
    {toParse: x, expected: {_type: 'Right', value: parsedX}}
  ])(
    'should parse $toParse as $expected',
    ({toParse, expected}) => expect(parseNewXml(toParse)).toEqual(expected)
  );

});