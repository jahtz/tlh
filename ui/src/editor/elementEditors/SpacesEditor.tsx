import {XmlEditableNodeIProps} from '../editorConfig/editorConfig';
import {WordNodeData} from './wordNodeData';
import {XmlElementNode} from '../xmlModel/xmlModel';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';

export function SpacesEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps<WordNodeData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="spacesCount" className="font-bold">{t('spacesCount')}:</label>
        <input type="number" id="spacesCount" defaultValue={(data.node.children[0] as XmlElementNode).attributes.c}
               className="p-2 rounded border border-slate-500 mt-2 w-full"
               onChange={(event) => updateNode({node: {children: {[0]: {attributes: {c: {$set: event.target.value}}}}}})}/>
      </div>

      <button type="button" disabled={!changed} onClick={initiateSubmit}
              className={classNames('p-2', 'rounded', 'text-center', 'w-full', changed ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}>
        {t('update')}
      </button>
    </div>
  );
}