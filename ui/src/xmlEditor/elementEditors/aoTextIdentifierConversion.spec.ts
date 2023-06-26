import {XmlElementNode, xmlElementNode, xmlTextNode} from 'simple_xml';
import {NewAoManuscriptsChildNode} from './AoManuscriptsEditor';
import {aoDirectJoin, aoInDirectJoin, convertNodeFormat, convertSingleFragment} from './aoTextIdentifierConversion';

const oldAoTxtPublNode = (content: string) => xmlElementNode('AO:TxtPubl', {}, [xmlTextNode(content)]);
const newAoTxtPublNode = (nr: string | undefined, content: string) => xmlElementNode('AO:TxtPubl', {nr}, [xmlTextNode(content)]);

interface TestData {
  oldChild: XmlElementNode<'AO:TxtPubl'>;
  newChildren: NewAoManuscriptsChildNode[];
}

describe('AO:Manuscripts format converted', () => {

  const testData: TestData[] = [
    {
      oldChild: oldAoTxtPublNode('KBo 14.92 {€1} + KBo 29.157 {€2}'),
      newChildren: [
        newAoTxtPublNode('€1', 'KBo 14.92'),
        aoDirectJoin, newAoTxtPublNode('€2', 'KBo 29.157')
      ]
    },
    {
      oldChild: oldAoTxtPublNode('KBo 15.64 {€1} + KBo 40.62 {€2} (+) KBo 35.256 {€3} + KBo 33.196 {€4} + KBo 15.68 {€5} + KBo 30.71 {€6} + KBo 34.183 {€7} + KBo 47.69a {€8} + ABoT 2.104 {€9} (+) KBo 47.69b {€10} + KBo 30.133 {€11} + FHG 14 {€12} + KBo 15.54 {€13} + KBo 15.56 {€14}'),
      newChildren: [
        newAoTxtPublNode('€1', 'KBo 15.64'),
        aoDirectJoin, newAoTxtPublNode('€2', 'KBo 40.62'),
        aoInDirectJoin, newAoTxtPublNode('€3', 'KBo 35.256'),
        aoDirectJoin, newAoTxtPublNode('€4', 'KBo 33.196'),
        aoDirectJoin, newAoTxtPublNode('€5', 'KBo 15.68'),
        aoDirectJoin, newAoTxtPublNode('€6', 'KBo 30.71'),
        aoDirectJoin, newAoTxtPublNode('€7', 'KBo 34.183'),
        aoDirectJoin, newAoTxtPublNode('€8', 'KBo 47.69a'),
        aoDirectJoin, newAoTxtPublNode('€9', 'ABoT 2.104'),
        aoInDirectJoin, newAoTxtPublNode('€10', 'KBo 47.69b'),
        aoDirectJoin, newAoTxtPublNode('€11', 'KBo 30.133'),
        aoDirectJoin, newAoTxtPublNode('€12', 'FHG 14'),
        aoDirectJoin, newAoTxtPublNode('€13', 'KBo 15.54'),
        aoDirectJoin, newAoTxtPublNode('€14', 'KBo 15.56')
      ]
    }
  ];

  test.each(testData)(
    'should convert $oldChild to $newChildren',
    ({oldChild, newChildren}) => expect(convertNodeFormat(oldChild)).toEqual(newChildren)
  );


  const singleTestData: { single: string, output: NewAoManuscriptsChildNode }[] = [
    {single: 'KBo 14.92 {€1}', output: newAoTxtPublNode('€1', 'KBo 14.92')},
    {single: 'KBo 29.157 {€2}', output: newAoTxtPublNode('€2', 'KBo 29.157')}
  ];

  test.each(singleTestData)(
    'should convert single string $single to $output',
    ({single, output}) => expect(convertSingleFragment('AO:TxtPubl', single)).toEqual(output)
  );

});