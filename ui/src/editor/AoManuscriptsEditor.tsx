import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {AoManuscriptsData, AoSource, SourceType, sourceTypes} from './editorConfig/aoManuscriptsConfigData';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {IoAddOutline, IoRemoveCircle} from 'react-icons/io5';


interface AoTextNumberFieldProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

function AoTextNumberField({source: {type, name}, updateType, updateText}: AoTextNumberFieldProps): JSX.Element {
  return (
    <>
      <div className="control">
        <div className="select is-fullwidth">
          <select defaultValue={type} onBlur={(event) => updateType(event.target.value as SourceType)}>
            {sourceTypes.map((st) => <option key={st}>{st}</option>)}
          </select>
        </div>
      </div>
      <div className="control is-expanded">
        <input type="text" className="input" defaultValue={name} onBlur={(event) => updateText(event.target.value)}/>
      </div>
    </>
  );
}

interface AoPlusFieldProps {
  source: string;
  onBlur: (value: string) => void;
}

function AoPlusField({source, onBlur}: AoPlusFieldProps): JSX.Element {
  return (
    <div className="control is-expanded">
      <input type="text" className="input" defaultValue={source} onBlur={(event) => onBlur(event.currentTarget.value)}/>
    </div>
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
    <>
      {data.content.map((source, index) =>
        <div className="field has-addons" key={index}>
          {typeof source === 'string'
            ? <AoPlusField key={index} source={source} onBlur={(value) => updatePlus(index, value)}/>
            : <AoTextNumberField key={index} source={source} updateType={(value) => updateType(index, value)}
                                 updateText={(value) => updateText(index, value)}/>}
          <div className="control">
            <button type="button" className="button is-danger" onClick={() => deleteEntry(index)}>
              <IoRemoveCircle/>
            </button>
          </div>
        </div>
      )}

      <div className="field">
        <button type="button" className="button is-link is-fullwidth" onClick={addEntry}>
          <IoAddOutline/>
        </button>
      </div>

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} onClick={initiateSubmit} disabled={!changed}>
        {t('updateNode')}
      </button>
    </>
  );
}