import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {LanguageInput} from '../LanguageInput';
import {NodeEditorRightSide} from '../NodeEditorRightSide';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import update from 'immutability-helper';

export interface LineBreakData {
  textId: string;
  lnr: string;
  lg: string | undefined;
}

export const lineBreakNodeConfig: XmlInsertableSingleEditableNodeConfig<LineBreakData> = {
  replace: (node, _renderedChildren, isSelected, isLeftSide) => displayReplace(
    <>
      {isLeftSide && <br/>}
      <span className={classNames(isSelected ? [selectedNodeClass, 'text-black'] : ['text-gray-500'])}>{node.attributes.lnr}:</span>
      &nbsp;&nbsp;&nbsp;
    </>
  ),
  edit: (props) => <LineBreakEditor key={props.path.join('.')} {...props} />,
  readNode: (node) => ({textId: node.attributes.txtid || '', lnr: node.attributes.lnr || '', lg: node.attributes.lg}),
  writeNode: ({textId, lnr, lg}, originalNode) => update(originalNode, {
    attributes: {txtid: {$set: textId}, lnr: {$set: lnr}, lg: {$set: lg || ''}}
  }),
  insertablePositions: {
    beforeElement: ['lb', 'w', 'gap'],
    asLastChildOf: ['div1']
  }
};

export function LineBreakEditor({
  data,
  updateNode,
  setKeyHandlingEnabled,
  rightSideProps
}: XmlEditableNodeIProps<LineBreakData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <NodeEditorRightSide {...rightSideProps}>
      <div>
        <div className="mb-4">
          <label htmlFor="textId" className="font-bold">{t('textId')}:</label>
          <input type="text" id="textId" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.textId} readOnly/>
        </div>

        <div className="mb-4">
          <label htmlFor="lineNumber" className="font-bold">{t('lineNumber')}:</label>
          <input type="text" id="lineNumber" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.lnr?.trim()}
                 onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateNode({lnr: {$set: event.target.value}})}/>
        </div>

        <div className="mb-4">
          <LanguageInput initialValue={data.lg} onChange={(value) => updateNode({lg: {$set: value}})}/>
        </div>
      </div>
    </NodeEditorRightSide>
  );
}