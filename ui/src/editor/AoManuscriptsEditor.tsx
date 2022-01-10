import {XmlEditableNodeIProps} from './editorConfig/editorConfig';
import {AoManuscriptsData, SourceType, sourceTypes} from './editorConfig/aoManuscriptsConfigData';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';


export function AoManuscriptsEditor({data, updateNode, changed, initiateSubmit}: XmlEditableNodeIProps<AoManuscriptsData>): JSX.Element {

  const {t} = useTranslation('common');

  function updateType(index: number, newType: SourceType): void {
    updateNode({sources: {[index]: {type: {$set: newType}}}});
  }

  function updateText(index: number, newText: string): void {
    updateNode({sources: {[index]: {name: {$set: newText}}}});
  }

  return (
    <>
      {data.sources.map(({type, name}, index) => <div className="field has-addons" key={name}>
        <div className="control">
          <div className="select is-fullwidth">
            <select defaultValue={type} onChange={(event) => updateType(index, event.target.value as SourceType)}>
              {sourceTypes.map((st) => <option key={st}>{st}</option>)}
            </select>
          </div>
        </div>
        <div className="control is-expanded">
          <input type="text" className="input" defaultValue={name} onChange={(event) => updateText(index, event.target.value)}/>
        </div>
      </div>)}

      <button type="button" className={classNames('button', 'is-fullwidth', {'is-link': changed})} onClick={initiateSubmit} disabled={!changed}>
        {t('updateNode')}
      </button>
    </>
  );
}