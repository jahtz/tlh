import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

export const paragraphSeparatorConfig: XmlSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected) => (
    <span className={classNames({'has-background-primary': isSelected})}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>
  ),
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  readNode: (node) => node,
  writeNode: (node) => node,
};

const separatorTypes: string[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({data, updateNode, changed, initiateSubmit, deleteNode}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="field">
        <div className="select is-fullwidth">
          <select defaultValue={data.tagName} onChange={(event) => updateNode({tagName: {$set: event.target.value}})}>
            {separatorTypes.map((st) => <option key={st}>{st}</option>)}
          </select>
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <button type="button" className="button is-danger is-fullwidth" onClick={deleteNode}>{t('deleteNode')}</button>
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