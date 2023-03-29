import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {LanguageInput} from '../LanguageInput';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export const lineBreakNodeConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'])}>{node.attributes.lnr}:</span>
      &nbsp;&nbsp;&nbsp;
    </>
  ),
  edit: (props) => <LineBreakEditor {...props} />,
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  }
};

function LineBreakEditor({node, updateEditedNode, setKeyHandlingEnabled}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="mb-4">
        <label htmlFor="txtId" className="font-bold">{t('textId')}:</label>
        <input type="text" id="txtId" className="mt-2 p-2 rounded border border-slate-500 w-full"
               defaultValue={node.attributes.txtid} readOnly/>
      </div>

      <div className="mb-4">
        <label htmlFor="lineNumber" className="font-bold">{t('lineNumber')}:</label>
        <input type="text" id="lineNumber" className="mt-2 p-2 rounded border border-slate-500 w-full"
               defaultValue={node.attributes.lnr?.trim()}
               onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateEditedNode({attributes: {lnr: {$set: event.target.value}}})}/>
      </div>

      <div className="mb-4">
        <LanguageInput initialValue={node.attributes.lg} onChange={(value) => updateEditedNode({attributes: {lg: {$set: value}}})}/>
      </div>
    </>
  );
}