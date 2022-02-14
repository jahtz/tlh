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
  jumpEditableNodes,
  setKeyHandlingEnabled,
  initiateSubmit
}: XmlEditableNodeIProps<NoteData>): JSX.Element {

  // console.info(JSON.stringify(data, null, 2));

  const {t} = useTranslation('common');

  return (
    <>
      <div className="field">
        <label htmlFor="n" className="label">n:</label>
        <div className="control">
          <input type="text" id="n" className="input" value={data.n} disabled/>
          <p className="help is-info">{t('recountedAtExport')}</p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="content" className="label">{t('content')}:</label>
        <div className="control">
          <input type="text" id="content" className="input" defaultValue={data.content} onFocus={() => setKeyHandlingEnabled(false)}
                 onBlur={(event) => updateNode({content: {$set: event.target.value}})}/>
        </div>
      </div>

      <div className="my-3">
        <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => jumpEditableNodes('note', forward)}
                               deleteElement={deleteNode}/>
      </div>

    </>
  );
}