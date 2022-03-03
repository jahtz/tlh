import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {XmlElementNode} from '../xmlModel/xmlModel';

function isLineGapNode(node: XmlElementNode): boolean {
  return 't' in node.attributes && node.attributes.t === 'line';
}

export const gapConfig: XmlSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected) => (
    <>
      {isLineGapNode(node) && <br/>}
      <span className={classNames('gap', {'marked': isSelected})}>{node.attributes.c}</span>
    </>
  ),
  edit: (props) => <GapEditor {...props}/>,
  readNode: (n) => n,
  writeNode: (n) => n
};

function GapEditor({data, updateNode, changed, initiateSubmit, deleteNode}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <div>
      <div className="flex">
        <label htmlFor="content" className="p-2 rounded-l border-l border-y border-slate-500">{t('content')}:</label>
        <input type="text" defaultValue={data.attributes.c} id="content" className="flex-grow p-2 rounded-r border border-slate-500"
               onBlur={(event) => updateNode({attributes: {c: {$set: event.target.value}}})}/>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="p-2 rounded bg-red-500 text-white" onClick={deleteNode} title={t('deleteNode')}>-</button>
        <button type="button" onClick={initiateSubmit}
                className={classNames('p-2', 'rounded', changed ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}>
          {t('update')}
        </button>
      </div>
    </div>
  );
}