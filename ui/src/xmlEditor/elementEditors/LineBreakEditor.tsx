import {inputClasses, XmlEditableNodeIProps, XmlSingleInsertableEditableNodeConfig} from '../editorConfig';
import {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import {LanguageInput} from '../LanguageInput';
import classNames from 'classnames';
import {selectedNodeClass, tlhXmlEditorConfig} from '../tlhXmlEditorConfig';
import {findFirstXmlElementByTagName, writeNode, XmlElementNode} from 'simple_xml';
import {getSiblingsUntil} from '../../nodeIterators';
import {AOption} from '../../myOption';
import {getCuneiformUrl} from '../../urls';

export const fetchCuneiform = async (rootNode: XmlElementNode, lbNodePath: number[]): Promise<string> => {
  const content = getSiblingsUntil(rootNode, lbNodePath, 'lb')
    .map((node) => writeNode(node, tlhXmlEditorConfig.writeConfig))
    .join(' ');

  const response = await fetch(getCuneiformUrl, {method: 'POST', body: JSON.stringify({number: 1, content})});

  const {cuneiform} = await response.json();

  return cuneiform;
};

type LineBreakAttributes = 'lnr' | 'cu' | 'txtid' | 'lg' | 'cuDirty';

export const lineBreakNodeConfig: XmlSingleInsertableEditableNodeConfig<'lb', LineBreakAttributes> = {
  replace: ({node, isSelected, isLeftSide}) => (
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'], {'bg-amber-500': node.attributes.cuDirty})}>
        {node.attributes.lnr}:
      </span>&nbsp;&nbsp;
    </>
  ),
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  },
  edit: (props) => <LineBreakEditor {...props}/>
};

const LineBreakEditor = ({
  node,
  path,
  updateEditedNode,
  updateAttribute,
  setKeyHandlingEnabled,
  rootNode
}: XmlEditableNodeIProps<'lb', LineBreakAttributes>): ReactElement => {

  const {t} = useTranslation('common');

  const textLanguage = AOption.of(findFirstXmlElementByTagName(rootNode, 'text'))
    .map((textElement) => textElement.attributes['xml:lang'])
    .get();

  const onCuneiformUpdate = async (): Promise<void> => {
    const cuneiform = await fetchCuneiform(rootNode, path);
    updateEditedNode({attributes: {'cu': {$set: cuneiform}, cuDirty: {$set: undefined}}});
  };

  return (
    <>
      <div className="mb-4">
        <label htmlFor="txtId" className="font-bold">{t('textId')}:</label>
        <input type="text" id="txtId" className={inputClasses} defaultValue={node.attributes.txtid} placeholder={t('textId') || 'textId'}
               onFocus={() => setKeyHandlingEnabled(false)} onBlur={() => setKeyHandlingEnabled(true)}
               onChange={(event) => updateAttribute('txtid', event.target.value)}/>
      </div>

      <div className="mb-4">
        <label htmlFor="lineNumber" className="font-bold">{t('lineNumber')}:</label>
        <input type="text" id="lineNumber" className={inputClasses} defaultValue={node.attributes.lnr?.trim()} onFocus={() => setKeyHandlingEnabled(false)}
               onBlur={() => setKeyHandlingEnabled(true)} onChange={(event) => updateAttribute('lnr', event.target.value)}/>
      </div>

      <div className="mb-4">
        <LanguageInput initialValue={node.attributes.lg} parentLanguages={{text: textLanguage}} onChange={(value) => updateAttribute('lg', value)}/>
      </div>

      <div className="mb-4">
        <label htmlFor="cuneiform" className="font-bold">{t('cuneiform')}</label>
        <input type="text" id="cuneiform" className={inputClasses} defaultValue={node.attributes.cu} onFocus={() => setKeyHandlingEnabled(false)}
               onBlur={() => setKeyHandlingEnabled(true)} onChange={(event) => updateAttribute('cu', event.target.value)}/>
        <button type="button" className="mt-2 p-2 rounded bg-amber-500 text-white w-full" onClick={onCuneiformUpdate}>{t('updateCuneiform')}</button>
      </div>
    </>
  );
};
