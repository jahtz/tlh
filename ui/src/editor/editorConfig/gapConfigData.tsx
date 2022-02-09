import {XmlEditableNodeIProps, XmlSingleEditableNodeConfig} from './editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

// FIXME: highlight!
export const gapConfig: XmlSingleEditableNodeConfig = {
  replace: (node, x, currentPath, currentSelectedPath) => {

    const isLineGap = 't' in node.attributes && node.attributes.t === 'line';
    const isSelected = currentSelectedPath && currentPath.join('.') === currentSelectedPath.join('.');

    return (
      <>
        {isLineGap && <br/>}
        <span className={classNames('gap', {'marked': isSelected})}>{node.attributes.c}</span>
      </>
    );
  },
  edit: (props) => <GapEditor {...props}/>,
  readNode: (n) => n,
  writeNode: (n) => n
};

function GapEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="field">
        <input type="text" defaultValue={data.attributes.c} className="input" onBlur={(event) => updateNode({attributes: {c: {$set: event.target.value}}})}/>
      </div>

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} disabled={!changed} onClick={initiateSubmit}>
        {t('update')}
      </button>
    </>
  );
}