import {parseNewXml, ParseResult} from './xmlReading';
import {xmlElementNode, textNode, XmlElementNode} from './xmlModel';

describe('xmlReader', () => {
  const x = '<w trans="%-nan~" mrp0sel="DEL"><del_fin/>x-<laes_in/>na-an<laes_fin/>-<del_in/></w>';
  const parsedX: XmlElementNode = {
    tagName: 'w',
    attributes: {trans: '%-nan~', mrp0sel: 'DEL'},
    children: [
      xmlElementNode('del_fin'), textNode('x-'), xmlElementNode('laes_in'), textNode('na-an'), xmlElementNode('laes_fin'), textNode('-'), xmlElementNode('del_in')
    ]
  };

  test.each<{ toParse: string, expected: ParseResult }>([
    {toParse: x, expected: {_type: 'Right', value: parsedX}}
  ])(
    'should parse $toParse as $expected',
    ({toParse, expected}) => expect(parseNewXml(toParse)).toEqual(expected)
  );

});