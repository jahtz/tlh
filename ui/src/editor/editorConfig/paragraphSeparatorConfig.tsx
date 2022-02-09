import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

export const paragraphSeparatorConfig: XmlSingleEditableNodeConfig = {
  replace: (node, _, currentPath, currentSelectedPath) => {

    const isSelected = currentSelectedPath && currentPath.join('.') === currentSelectedPath.join('.');

    return <span className={classNames({'has-background-primary': isSelected})}>
      {node.tagName === 'parsep' ? '¬¬¬' : '==='}
    </span>;
  },
  edit: (props) => <ParagraphSeparatorEditor {...props}/>,
  readNode: (node) => node,
  writeNode: (node) => node,
};

const separatorTypes: string[] = ['parsep', 'parsep_dbl'];

function ParagraphSeparatorEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps): JSX.Element {

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

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} disabled={!changed} onClick={initiateSubmit}>
        {t('update')}
      </button>
    </>
  );
}