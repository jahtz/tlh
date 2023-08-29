import {ReactElement, useState} from 'react';
import {MyLeft, parseNewXml, XmlElementNode} from 'simple_xml';
import {tlhXmlEditorConfig} from './tlhXmlEditorConfig';
import {XmlRepair} from '../manuscript/review/XmlRepair';

interface IProps {
  xmlSource: string;
  children: (rootNode: XmlElementNode) => ReactElement;
}

export function XmlValidityChecker({xmlSource, children}: IProps): ReactElement {

  const [rootNodeParseResult, setRootNodeParseResult] = useState(parseNewXml(xmlSource, tlhXmlEditorConfig.readConfig));

  return rootNodeParseResult instanceof MyLeft
    ? (
      <div className="container mx-auto">
        <XmlRepair brokenXml={xmlSource} onUpdate={(value) => setRootNodeParseResult(parseNewXml(value, tlhXmlEditorConfig.readConfig))}/>
      </div>
    ) : children(rootNodeParseResult.value as XmlElementNode);

}