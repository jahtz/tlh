import {displayReplace, XmlEditableNodeIProps, XmlInsertableSingleEditableNodeConfig} from '../editorConfig';
import {useTranslation} from 'react-i18next';
import {NodeEditorRightSide} from '../NodeEditorRightSide';
import classNames from 'classnames';
import {selectedNodeClass} from '../tlhXmlEditorConfig';
import update from 'immutability-helper';
import {xmlElementNode} from '../../xmlModel/xmlModel';

export interface ClbData {
  id: string;
}

export const clbNodeConfig: XmlInsertableSingleEditableNodeConfig<ClbData> = {
  // TODO: how to display <clb/> in xml editor?
  replace: (node, _element, isSelected) => displayReplace(
    <>
      <span className={classNames(isSelected ? selectedNodeClass : 'bg-amber-500')}>{node.attributes.id}</span>&nbsp;
    </>
  ),
  edit: (props) => <ClbEditor {...props}/>,
  readNode: (node): ClbData => ({id: node.attributes.id || ''}),
  writeNode: ({id: newId}, node) => update(node, {attributes: {id: {$set: newId}}}),
  insertablePositions: {
    beforeElement: ['w', 'parsep', 'parsep_dbl'],
    afterElement: ['w'],
    newElement: () => xmlElementNode('clb', {id: 'CLB'})
  }
};

export function ClbEditor({data, updateNode, setKeyHandlingEnabled, rightSideProps}: XmlEditableNodeIProps<ClbData>): JSX.Element {

  const {t} = useTranslation('common');

  return (
    <NodeEditorRightSide {...rightSideProps}>

      <div className="mb-4">
        <label htmlFor="lineNumber" className="font-bold">{t('id')}:</label>
        <input type="text" id="lineNumber" className="p-2 rounded border border-slate-500 w-full mt-2" defaultValue={data.id.trim()}
               onFocus={() => setKeyHandlingEnabled(false)} onChange={(event) => updateNode({id: {$set: event.target.value}})}/>
      </div>

    </NodeEditorRightSide>
  );
}