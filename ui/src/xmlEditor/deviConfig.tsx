import {inputClasses, XmlEditableNodeIProps, XmlEditorSingleNodeConfig} from './editorConfig';
import {JSX} from 'react';
import {displayReplace} from './editorConfig/displayReplacement';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {selectedNodeClass} from './tlhXmlEditorConfig';

export const deviConfig: XmlEditorSingleNodeConfig<'devi', 'expl'> = {
  replace: ({node, renderChildren, isSelected}) => displayReplace(
    <>(<span className={classNames('font-bold', {[selectedNodeClass]: isSelected})}>{node.attributes.expl}</span>: </>,
    renderChildren(),
    <>)</>
  ),
  edit: (props) => <DeviEditor {...props}/>,
  insertablePositions: {
    beforeElement: ['lb', 'w'],
    afterElement: ['w'],
    asFirstChildOf: ['devi'],
    asLastChildOf: ['div1', 'cl']
  }
};

function DeviEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps<'devi', 'expl'>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <label htmlFor="expl" className="font-bold">{t('expl')}:</label>
      <input type="text" id="expl" className={inputClasses} defaultValue={node.attributes.expl} onFocus={() => setKeyHandlingEnabled(false)}
             onBlur={() => setKeyHandlingEnabled(true)} onChange={(event) => updateAttribute('expl', event.target.value)}/>
    </>
  );
}