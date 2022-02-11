import {XmlEditableNodeIProps} from './editorConfig';
import {WordNodeData} from './wordNodeData';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';

export function SpacesEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="field">
        <label htmlFor="spacesCount" className="label">{t('spacesCount')}:</label>
        <input type="number" id="spacesCount" defaultValue={(data.node.children[0] as XmlElementNode).attributes.c} className="input"
               onChange={(event) => updateNode({node: {children: {[0]: {attributes: {c: {$set: event.target.value}}}}}})}/>
      </div>

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} disabled={!changed} onClick={initiateSubmit}>
        {t('update')}
      </button>
    </>
  );
}