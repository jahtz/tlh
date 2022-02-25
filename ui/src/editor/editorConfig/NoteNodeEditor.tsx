import {XmlEditableNodeIProps} from './editorConfig';
import {NoteData} from './noteData';
import {useTranslation} from 'react-i18next';
import {UpdatePrevNextButtons} from '../morphAnalysisOption/UpdatePrevNextButtons';
import {isXmlTextNode, XmlElementNode, XmlNode} from '../xmlModel/xmlModel';

export function reCountNoteNumbers(rootNode: XmlElementNode): void {

  function go(node: XmlNode, currentCount: number): number {
    if (isXmlTextNode(node)) {
      return currentCount;
    } else {
      if (node.tagName === 'note') {
        node.attributes.n = currentCount.toString();
        currentCount++;
      }

      for (const child of node.children) {
        currentCount = go(child, currentCount);
      }

      return currentCount;
    }
  }

  go(rootNode, 1);
}

export function NoteNodeEditor({
  data,
  changed,
  updateNode,
  deleteNode,
  setKeyHandlingEnabled,
  initiateSubmit,
  initiateJumpElement
}: XmlEditableNodeIProps<NoteData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="n" className="font-bold">n:</label>
        <input type="text" id="n" className="p-2 mt-2 rounded border border-slate-500 w-full" value={data.n} disabled/>
        <p className="text-blue-600 text-sm">{t('recountedAtExport')}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="font-bold">{t('content')}:</label>
        <input type="text" id="content" className="p-2 mt-2 rounded border border-slate-500 w-full" defaultValue={data.content} placeholder={t('content')}
               onFocus={() => setKeyHandlingEnabled(false)} onBlur={(event) => updateNode({content: {$set: event.target.value}})}/>
      </div>

      <div className="my-3">
        <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => initiateJumpElement(forward)}
                               deleteElement={deleteNode}/>
      </div>

    </div>
  );
}