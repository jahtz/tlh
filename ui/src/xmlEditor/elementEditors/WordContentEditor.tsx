import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {transliteration as transliterationLanguage} from '../../transliterationParser/lineContentParser';
import {AOWord, xmlifyAoWord} from '../../model/sentenceContent/word';
import {Result} from 'parsimmon';
import {XmlElementNode} from '../../xmlModel/xmlModel';
import classNames from 'classnames';
import {fetchMorphologicalAnalyses} from '../../model/morphologicalAnalysis';
import {NodeDisplay} from '../NodeDisplay';
import {writeNode} from '../../xmlModel/xmlWriting';
import update from 'immutability-helper';

interface IProps {
  initialTransliteration: string;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode) => void;
}

interface IState {
  parseResult: Result<XmlElementNode>;
}

function readTransliteration(transliteration: string): IState {
  const parseResult: Result<AOWord> = transliterationLanguage.word.parse(transliteration);

  return parseResult.status
    ? {parseResult: {status: true, value: xmlifyAoWord(parseResult.value)}}
    : {parseResult};
}

export function WordContentEditor({initialTransliteration, cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const [state, setState] = useState<IState>(readTransliteration(initialTransliteration));

  function submitEdit() {
    state.parseResult.status && updateNode(state.parseResult.value);
  }

  function updateMorphologies(): void {
    if (state.parseResult.status) {
      fetchMorphologicalAnalyses(writeNode(state.parseResult.value).join(''), 'Hit')
        .then((res) => {
          if (res) {
            setState((state) => update(state, {parseResult: {value: {attributes: {$set: res}}}}));
          } else {
            alert('Could not find any morphological analyses...');
          }
        })
        .catch((err) => console.error(err));
    } else {
      alert('Can\'t query for morphological analyses!');
    }
  }

  return (
    <div>
      <div className="flex">
        <label htmlFor="newTransliteration" className="p-2 rounded-l border-l border-y border-slate-500 font-bold">{t('newTransliteration')}:</label>

        <input defaultValue={initialTransliteration} className="flex-grow rounded-r border border-slate-500 p-2" id="newTransliteration"
               placeholder={t('newTransliteration')} onChange={(event) => setState(readTransliteration(event.target.value))}/>
      </div>

      <hr className="mt-4"/>

      <div className="rounded-t">
        <div className={classNames('p-2', 'rounded-t', state.parseResult.status ? 'bg-green-500' : 'bg-red-600', 'text-white', 'font-bold')}>{t('result')}</div>
        <div className={classNames('p-4', state.parseResult.status ? 'bg-green-50' : 'bg-red-200')}>
          {state.parseResult.status
            ? (
              <>
                <div className="p-2 rounded bg-white">
                  <NodeDisplay node={state.parseResult.value} currentSelectedPath={undefined} isLeftSide={false}/>
                </div>
                <div className="mt-2 p-2 rounded bg-white">{writeNode(state.parseResult.value).join('')}</div>
              </>
            )
            : <pre>{JSON.stringify(state, null, 2)}</pre>
          }
        </div>
      </div>

      {state.parseResult.status && <button type="button" className="mt-4 p-2 rounded bg-blue-600 text-white w-full" onClick={updateMorphologies}>
        {t('fetchMorphologicalAnalyses')}
      </button>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={cancelEdit} className="p-2 rounded bg-amber-400">{t('cancelEdit')}</button>
        <button type="button" onClick={submitEdit} className="p-2 rounded bg-blue-600 text-white">{t('submitEdit')}</button>
      </div>
    </div>
  );
}