import {XmlEditableNodeIProps} from './editorConfig';
import {NoteData} from './noteData';
import {useTranslation} from 'react-i18next';
import {UpdatePrevNextButtons} from '../morphAnalysisOption/UpdatePrevNextButtons';

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
          <input type="text" id="n" className="input" value={data.n} onFocus={() => setKeyHandlingEnabled(false)}
                 onBlur={(event) => updateNode({n: {$set: event.target.value}})}/>
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
        <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => jumpEditableNodes('note', forward)}>
          <div className="control is-expanded">
            <button type="button" className="button is-danger is-fullwidth" onClick={deleteNode}>{t('deleteNode')}</button>
          </div>
        </UpdatePrevNextButtons>
      </div>

    </>
  );
}