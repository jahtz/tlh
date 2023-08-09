import {inputClasses, XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {JSX} from 'react';

type noteAttrs = 'n' | 'c';

export const noteNodeConfig: XmlSingleEditableNodeConfig<'note', noteAttrs> = {
  replace: ({node}) => <sup title={node.attributes.c} className="has-text-weight-bold">x</sup>,
  edit: (props) => <NoteNodeEditor {...props}/>
};

function NoteNodeEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps<'note', noteAttrs>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="mb-4">
        <label htmlFor="n" className="font-bold">n:</label>
        <input type="text" id="n" className={inputClasses} value={node.attributes.n} disabled/>
        <p className="text-blue-600 text-sm">{t('recountedAtExport')}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="font-bold">{t('content')}:</label>
        <input type="text" id="content" className={inputClasses} placeholder={t('content') || 'content'} defaultValue={node.attributes.c}
               onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateAttribute('c', event.target.value)}/>
      </div>
    </>
  );
}