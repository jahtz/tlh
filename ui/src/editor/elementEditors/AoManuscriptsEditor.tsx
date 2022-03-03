import {XmlEditableNodeIProps} from '../editorConfig/editorConfig';
import {AoManuscriptsData, AoSource, SourceType, sourceTypes} from './aoManuscriptsConfigData';
import {DeleteButton} from '../../bulmaHelpers/Buttons';
import {NodeEditorRightSide} from '../NodeEditorRightSide';

interface AoTextNumberFieldProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

function AoTextNumberField({source: {type, name}, updateType, updateText}: AoTextNumberFieldProps): JSX.Element {
  return (
    <>
      <select defaultValue={type} className="p-2 rounded-l border-l border-y border-slate-500 bg-gray-100"
              onBlur={(event) => updateType(event.target.value as SourceType)}>
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name} onBlur={(event) => updateText(event.target.value)}/>
    </>
  );
}

export function AoManuscriptsEditor({data, originalNode, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps<AoManuscriptsData>): JSX.Element {

  function updateType(index: number, newType: SourceType): void {
    updateNode({content: {[index]: {type: {$set: newType}}}});
  }

  function updateText(index: number, newText: string): void {
    updateNode({content: {[index]: {name: {$set: newText}}}});
  }

  function updatePlus(index: number, newText: string): void {
    updateNode({content: {[index]: {$set: newText}}});
  }

  function addEntry(): void {
    updateNode({content: {$push: ['+', {type: 'AO:TxtPubl', name: ''}]}});
  }

  function deleteEntry(index: number): void {
    updateNode({content: {$splice: [[index, 1]]}});
  }

  return (
    <NodeEditorRightSide originalNode={originalNode} changed={changed} initiateSubmit={initiateSubmit}>
      <div>
        {data.content.map((source, index) =>
          <div className="mt-2 flex" key={index}>
            {typeof source === 'string'
              ? <input key={index} className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={source}
                       onBlur={(event) => updatePlus(index, event.currentTarget.value)}/>
              : <AoTextNumberField key={index} source={source} updateType={(value) => updateType(index, value)}
                                   updateText={(value) => updateText(index, value)}/>}

            <DeleteButton onClick={() => deleteEntry(index)} otherClasses={['px-4', 'py-2', 'rounded-r']}/>
          </div>
        )}

        <button type="button" className="mt-2 p-2 rounded border bg-blue-600 text-white text-center w-full" onClick={addEntry}>+</button>
      </div>
    </NodeEditorRightSide>
  );
}