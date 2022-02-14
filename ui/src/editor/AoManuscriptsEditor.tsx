import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {AoManuscriptsData, AoSource, SourceType, sourceTypes} from './editorConfig/aoManuscriptsConfigData';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IoRemoveCircle} from 'react-icons/io5';


interface AoTextNumberFieldProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

function AoTextNumberField({source: {type, name}, updateType, updateText}: AoTextNumberFieldProps): JSX.Element {
  return (
    <>
      <select defaultValue={type} onBlur={(event) => updateType(event.target.value as SourceType)}
              className="p-2 rounded-l border border-slate-500 bg-gray-100">
        {sourceTypes.map((st) => <option key={st}>{st}</option>)}
      </select>
      <input type="text" className="flex-grow p-2 border border-slate-500" defaultValue={name} onBlur={(event) => updateText(event.target.value)}/>
    </>
  );
}

interface AoPlusFieldProps {
  source: string;
  onBlur: (value: string) => void;
}

function AoPlusField({source, onBlur}: AoPlusFieldProps): JSX.Element {
  return (
    <input className="flex-grow p-2 rounded-l border border-slate-500" type="text" defaultValue={source} onBlur={(event) => onBlur(event.currentTarget.value)}/>
  );
}

export function AoManuscriptsEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps<AoManuscriptsData>): JSX.Element {

  const {t} = useTranslation('common');

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
    <div>
      {data.content.map((source, index) =>
        <div className="my-2 flex flex-row" key={index}>
          {typeof source === 'string'
            ? <AoPlusField key={index} source={source} onBlur={(value) => updatePlus(index, value)}/>
            : <AoTextNumberField key={index} source={source} updateType={(value) => updateType(index, value)}
                                 updateText={(value) => updateText(index, value)}/>}
          <button type="button" className="p-2 rounded-r border-r bg-red-500 text-white" onClick={() => deleteEntry(index)}>
            <IoRemoveCircle/>
          </button>
        </div>
      )}

      <button type="button" className="p-2 mb-2 rounded border bg-blue-600 text-white text-center w-full" onClick={addEntry}>+</button>

      <button type="button" onClick={initiateSubmit} disabled={!changed}
              className={classNames('p-2', 'rounded', 'text-center', 'w-full', changed ? ['bg-blue-600', 'text-white'] : ['border', 'border-slate-500'])}>
        {t('updateNode')}
      </button>
    </div>
  );
}