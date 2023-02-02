import {MergeLine} from './mergeDocument';
import {MergeDocumentLine} from './DocumentMerger';
import {useTranslation} from 'react-i18next';
import {XmlElementNode, XmlNode} from '../xmlModel/xmlModel';
import {writeNode} from '../xmlModel/xmlWriting';
import {handleSaveToPC} from '../xmlEditor/XmlDocumentEditorContainer';

interface IProps {
  lines: MergeLine[];
  header: XmlElementNode;
}

export function MergedDocumentView({lines, header}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function onExport(): void {

    const newText: XmlElementNode = {
      tagName: 'text',
      attributes: {},
      children:
        lines
        .map<XmlNode[]>(({lineNumberNode, rest}) => [lineNumberNode, ...rest])
        .flat()
    };
    const xmlMeta = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<?xml-stylesheet href="HPMxml.css" type="text/css"?>';

    const exported = xmlMeta + writeNode(header).join('\n') + writeNode( newText).join('\n');

    handleSaveToPC(exported, 'merged.xml');
  }

  return (
    <>
      <button type="button" className="mb-2 p-2 rounded bg-blue-500 text-white w-full" onClick={onExport}>{t('export')}</button>

      {lines.map((l, index) => <p key={index}><MergeDocumentLine line={l}/></p>)}
    </>
  );
}