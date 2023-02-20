import {displayReplace, XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {XmlElementNode} from 'simple_xml';

export const noteNodeConfig: XmlSingleEditableNodeConfig<XmlElementNode<'note'>> = {
  replace: (node) => displayReplace(<sup title={node.attributes.c} className="has-text-weight-bold">x</sup>),
  edit: (props) => <NoteNodeEditor {...props}/>,
  readNode: (node) => node as XmlElementNode<'note'>,
  writeNode: (newNode) => newNode
};

function NoteNodeEditor({data, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps<XmlElementNode<'note'>>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="mb-4">
        <label htmlFor="n" className="font-bold">n:</label>
        <input type="text" id="n" className="mt-2 p-2 rounded border border-slate-500 w-full" value={data.attributes.n} disabled/>
        <p className="text-blue-600 text-sm">{t('recountedAtExport')}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="font-bold">{t('content')}:</label>
        <input type="text" id="content" className="mt-2 p-2 rounded border border-slate-500 w-full" placeholder={t('content')}
               defaultValue={data.attributes.c}
               onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateEditedNode({attributes: {c: {$set: event.target.value}}})}/>
      </div>
    </>
  );
}