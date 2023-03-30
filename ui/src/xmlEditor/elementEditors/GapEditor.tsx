import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';
import {XmlElementNode} from 'simple_xml';

function isLineGapNode(node: XmlElementNode): boolean {
  return 't' in node.attributes && node.attributes.t === 'line';
}

export const gapConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      {isLineGapNode(node) && isLeftSide && <br/>}
      <span className={classNames('gap', {'marked': isSelected})}>{node.attributes.c}</span>
    </>
  ),
  insertablePositions: {
    beforeElement: ['w'],
    afterElement: ['lb', 'w'],
    asLastChildOf: ['div1']
  },
  edit: ({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps): JSX.Element => {

    const {t} = useTranslation('common');

    return (
      <>
        <label htmlFor="content" className="font-bold">{t('content')}:</label>
        <input type="text" id="content" className="mt-2 p-2 rounded border border-slate-500 w-full"
               defaultValue={node.attributes.c}
               onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateAttribute('c', event.target.value)}/>
      </>
    );
  }
};
