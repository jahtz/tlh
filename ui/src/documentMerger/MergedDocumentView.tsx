import {MergeLine} from './mergeDocument';
import {MergeDocumentLine} from './DocumentMerger';
import {useTranslation} from 'react-i18next';
import {findFirstXmlElementByTagName, isXmlTextNode, xmlElementNode, XmlElementNode, XmlNode, xmlTextNode} from '../xmlModel/xmlModel';
import {writeNode} from '../xmlModel/xmlWriting';
import {handleSaveToPC} from '../xmlEditor/XmlDocumentEditorContainer';
import xmlFormat from 'xml-formatter';

interface IProps {
  lines: MergeLine[];
  header: XmlElementNode;
  publicationMapping: Map<string, string[]>;
}

export function MergedDocumentView({lines, header, publicationMapping}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function onExport(): void {
    const lineNodes = lines
      .map<XmlNode[]>(({lineNumberNode, rest}) => [lineNumberNode, ...rest])
      .flat();
    const childNodes = writePublMapping().concat(lineNodes);
    const newText: XmlElementNode = {
      tagName: 'text',
      attributes: {},
      children: childNodes
    };
    const xmlMeta = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<?xml-stylesheet href="HPMxml.css" type="text/css"?>';

    const exported = xmlMeta + writeNode(header).join('\n') + '\n' + writeNode( newText).join('\n');

    let filename = 'merged';
    const docIDnode = findFirstXmlElementByTagName(header, 'docID');
    if (docIDnode && isXmlTextNode(docIDnode.children[0])) {
      filename = docIDnode.children[0].textContent;
    }
    handleSaveToPC(exported, filename + '.xml');
  }

  function writePublMapping(): XmlNode[] {
    const publications: XmlElementNode[] = [];
    console.log(publicationMapping);
    for (const publ of Array.from(publicationMapping.values())) {
      console.log(publ[1] + '{€' + publ[0] + '}');
      publications.push(xmlElementNode('AO:TxtPubl', {}, [xmlTextNode(publ[1] + '{€' + publ[0] + '}')]));
    }

    return [xmlElementNode('AO:Manuscripts', {}, publications)];
  }

  return (
    <>
      <button type="button" className="mb-2 p-2 rounded bg-blue-500 text-white w-full" onClick={onExport}>{t('export')}</button>
      <pre><code>{xmlFormat(writeNode(header).join('\n'), {
        indentation: '  ',
        collapseContent: true,
        lineSeparator: '\n'
      })}</code></pre>
      {lines.map((l, index) => <p key={index}><MergeDocumentLine line={l}/></p>)}
    </>
  );
}