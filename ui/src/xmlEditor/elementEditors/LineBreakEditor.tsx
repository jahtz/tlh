import {displayReplace, inputClasses, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {LanguageInput} from '../LanguageInput';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';

export const lineBreakNodeConfig: XmlInsertableSingleEditableNodeConfig = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'])}>{node.attributes.lnr}:</span>
      &nbsp;&nbsp;
    </>
  ),
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  },
  edit: (props) => <LineBreakEditor {...props}/>
};


function LineBreakEditor({node, updateAttribute, setKeyHandlingEnabled}: XmlEditableNodeIProps): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <>
      <div className="mb-4">
        <label htmlFor="txtId" className="font-bold">{t('textId')}:</label>
        <input type="text" id="txtId" className={inputClasses} defaultValue={node.attributes.txtid} placeholder={t('textId') || 'textId'} readOnly/>
      </div>

      <div className="mb-4">
        <label htmlFor="lineNumber" className="font-bold">{t('lineNumber')}:</label>
        <input type="text" id="lineNumber" className={inputClasses} defaultValue={node.attributes.lnr?.trim()} onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateAttribute('lnr', event.target.value)}/>
      </div>

      <div className="mb-4">
        <label htmlFor="cuneiform" className="font-bold">{t('cuneiform')}</label>
        <input type="text" id="cuneiform" className={inputClasses} defaultValue={node.attributes.cu} onFocus={() => setKeyHandlingEnabled(false)}
               onChange={(event) => updateAttribute('cu', event.target.value)}/>
      </div>

      <div className="mb-4">
        <LanguageInput initialValue={node.attributes.lg} onChange={(value) => updateAttribute('lg', value)}/>
      </div>
    </>
  );
}
