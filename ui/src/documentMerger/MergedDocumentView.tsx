import {MergeLine} from './mergeDocument';
import {MergeDocumentLine} from './DocumentMerger';
import {useTranslation} from 'react-i18next';
import {XmlElementNode, XmlNode} from '../xmlEditor/transliterationEditor/xmlModel/xmlModel';
import {handleSaveToPC} from '../xmlEditor/transliterationEditor/DocumentEditorContainer';
import {writeNode} from '../xmlEditor/transliterationEditor/xmlModel/xmlWriting';

interface IProps {
  lines: MergeLine[];
}

export function MergedDocumentView({lines}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function onExport(): void {
    const newRoot: XmlElementNode = {
      tagName: 'merged',
      attributes: {},
      children: lines
        .map<XmlNode[]>(({lineNumberNode, rest}) => [lineNumberNode, ...rest])
        .flat()
    };

    const exported = writeNode(newRoot).join('\n');

    handleSaveToPC(exported, 'merged.xml');
  }

  return (
    <>
      <button type="button" className="mb-2 p-2 rounded bg-blue-500 text-white w-full" onClick={onExport}>{t('export')}</button>

      {lines.map((l, index) => <p key={index}><MergeDocumentLine line={l}/></p>)}
    </>
  );
}