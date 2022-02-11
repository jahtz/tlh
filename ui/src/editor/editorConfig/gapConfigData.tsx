import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {IoRemoveCircle} from 'react-icons/io5';
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
    <>
      <div className="field">
        <input type="text" defaultValue={data.attributes.c} className="input" onBlur={(event) => updateNode({attributes: {c: {$set: event.target.value}}})}/>
      </div>

      <div className="columns">
        <div className="column">
          <button type="button" className="button is-danger is-fullwidth" onClick={deleteNode}>
            <IoRemoveCircle/>
          </button>
        </div>
        <div className="column">
          <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} disabled={!changed} onClick={initiateSubmit}>
            {t('update')}
          </button>
        </div>
      </div>
    </>
  );
}