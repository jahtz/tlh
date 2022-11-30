import {displayReplace, XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {UpdatePrevNextButtons} from '../morphAnalysisOption/UpdatePrevNextButtons';
import {XmlElementNode} from '../../xmlModel/xmlModel';

export const noteNodeConfig: XmlSingleEditableNodeConfig<XmlElementNode<'note'>> = {
  replace: (node) => displayReplace(<sup title={node.attributes.c} className="has-text-weight-bold">x</sup>),
  edit: (props) => <NoteNodeEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'note'>,
  writeNode: (newNode) => newNode
};

export function NoteNodeEditor({
  data,
  updateNode,
  setKeyHandlingEnabled,
  initiateJumpElement,
  rightSideProps: {changed, deleteNode, initiateSubmit}
}: XmlEditableNodeIProps<XmlElementNode<'note'>>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="n" className="font-bold">n:</label>
        <input type="text" id="n" className="p-2 mt-2 rounded border border-slate-500 w-full" value={data.attributes.n} disabled/>
        <p className="text-blue-600 text-sm">{t('recountedAtExport')}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="font-bold">{t('content')}:</label>
        <input type="text" id="content" className="p-2 mt-2 rounded border border-slate-500 w-full" defaultValue={data.attributes.c} placeholder={t('content')}
               onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateNode({attributes: {c: {$set: event.target.value}}})}/>
      </div>

      <div className="my-3">
        <UpdatePrevNextButtons changed={changed} initiateUpdate={initiateSubmit} initiateJumpElement={(forward) => initiateJumpElement(forward)}
                               deleteElement={deleteNode}/>
      </div>

    </div>
  );
}