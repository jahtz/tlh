import {MergeLine} from './mergeDocument';
import {JSX, useState} from 'react';
import {MergeDocumentLine, PublicationMap} from './DocumentMerger';
import {useTranslation} from 'react-i18next';
import {
  findFirstXmlElementByTagName,
  isXmlElementNode,
  isXmlTextNode,
  writeNode,
  writeNodeWithDefaultWriteConfig,
  XmlElementNode,
  xmlElementNode,
  XmlNode,
  xmlTextNode
} from 'simple_xml';
import xmlFormat from 'xml-formatter';
import {tlhXmlEditorConfig} from '../xmlEditor/tlhXmlEditorConfig';
import {makeDownload} from '../downloadHelper';
import {defaultAoXmlAttributes} from '../manuscript/xmlConversion/TransliterationCheck';

interface IProps {
  lines: MergeLine[];
  header: XmlElementNode;
  publicationMapping: PublicationMap;
}

interface exportState {
  mergerName: string;
  isExportDisabled: boolean;
}

function writePublicationMapping(publicationMap: PublicationMap): XmlNode[] {
  const publications: XmlNode[] = [];

  Array.from(publicationMap.values())
    .forEach((publication, index) => {
      if (index > 0) {
        publications.push(xmlTextNode('+'));
      }

      // FIXME: move to new format!
      publications.push(
        xmlElementNode('AO:TxtPubl', {}, [
          xmlTextNode(`${publication[1]} {€${publication[0]}}`.replaceAll(/[\n\t/]/, ''))
        ])
      );
    });

  return [
    xmlElementNode('AO:Manuscripts', {}, publications)
  ];
}

const getPublicationMappingString = (publicationMapping: XmlNode[]): string[] => publicationMapping
  .filter((publication): publication is XmlElementNode => isXmlElementNode(publication))
  .flatMap(({children}) => children)
  .flatMap((childPub) => {
    if (isXmlTextNode(childPub)) {
      return [childPub.textContent];
    } else if (isXmlElementNode(childPub) && isXmlTextNode(childPub.children[0])) {
      return [childPub.children[0].textContent];
    } else {
      return [];
    }
  });

export function MergedDocumentView({lines, header, publicationMapping}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<exportState>({mergerName: '', isExportDisabled: true});

  function onExport(): void {
    const lineNodes = lines
      .map<XmlNode[]>(({lineNumberNode, rest}) => [lineNumberNode, ...rest])
      .flat();

    const aoManuscriptsNode = writePublicationMapping(publicationMapping);
    const publicationMappingString: string[] = getPublicationMappingString(aoManuscriptsNode);

    header.children
      .filter((node): node is XmlElementNode => isXmlElementNode(node))
      .filter(({tagName}) => tagName === 'meta')
      .flatMap(({children}) => children)
      .filter((childNode): childNode is XmlElementNode => isXmlElementNode(childNode))
      .filter(({tagName}) => tagName === 'merge')
      .forEach((childNode) => {
        childNode.attributes['editor'] = state.mergerName;
        childNode.attributes['docs'] = publicationMappingString.join(' ');
        // console.log(childNode.attributes['editor']);
      });

    const AOxml: XmlElementNode = xmlElementNode('AOxml', defaultAoXmlAttributes, [
        header,
        xmlElementNode('body', {}, [
          xmlElementNode('div1', {type: 'transliteration'}, [
            // TODO: update text lang in merged document!
            xmlElementNode('text', {'xml:lang': 'XXXlang'}, [...aoManuscriptsNode, ...lineNodes])
          ])
        ])
      ]
    );

    const exported: string = writeNode(AOxml, tlhXmlEditorConfig.writeConfig).join('\n');
    console.log(exported);

    const docIDnode = findFirstXmlElementByTagName(header, 'docID');

    const filename = docIDnode && isXmlTextNode(docIDnode.children[0])
      ? docIDnode.children[0].textContent
      : 'merged';

    makeDownload(exported, filename + '.xml');
  }

  function setMergerReg(input: string) {
    setState({mergerName: input, isExportDisabled: (input == '')});
  }

  return (
    <>
      <div className="mb-4">
        <label htmlFor="mergerName" className="font-bold">{t('editorName')}:</label>
        <input name="mergerName" id="mergerName" placeholder={t('editorAbbreviation')} className="mt-2 p-2 rounded border w-full"
               onChange={e => setMergerReg(e.target.value)}></input>
      </div>
      <button type="button" className="mb-2 p-2 rounded bg-blue-500 text-white w-full" onClick={onExport} disabled={state.isExportDisabled}>{
        state.isExportDisabled ? t('disabled_export') : t('export')
      }</button>
      <pre><code>{xmlFormat(writeNodeWithDefaultWriteConfig(header).join('\n'), {
        indentation: '  ',
        collapseContent: true,
        lineSeparator: '\n'
      })}</code></pre>
      {lines.map((l, index) => <p key={index}><MergeDocumentLine line={l}/></p>)}
    </>
  );
}