import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {AoManuscriptsData, AoSource, SourceType, sourceTypes} from './editorConfig/aoManuscriptsConfigData';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';


interface AoTextNumberFieldProps {
  source: AoSource;
  updateType: (newType: SourceType) => void;
  updateText: (newText: string) => void;
}

function AoTextNumberField({source: {type, name}, updateType, updateText}: AoTextNumberFieldProps): JSX.Element {
  return (
    <div className="field has-addons" key={name}>
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

  return (
    <>
      {data.content.map((source, index) =>
        typeof source === 'string'
          ? <div className="field">
            <input type="text" className="input" defaultValue={source} onBlur={(event) => updatePlus(index, event.currentTarget.value)}/>
          </div>
          : <AoTextNumberField key={index} source={source} updateType={(value) => updateType(index, value)} updateText={(value) => updateText(index, value)}/>
      )}

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} onClick={initiateSubmit} disabled={!changed}>
        {t('updateNode')}
      </button>
    </>
  );
}