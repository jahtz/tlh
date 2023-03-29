import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Result} from 'parsimmon';
import {writeNode, XmlElementNode} from 'simple_xml';
import classNames from 'classnames';
import {fetchMorphologicalAnalyses} from '../../model/morphologicalAnalysis';
import {NodeDisplay} from '../NodeDisplay';
import update from 'immutability-helper';
import {reconstructTransliteration} from '../transliterationReconstruction';
import {Word} from 'simtex';
import {tlhXmlEditorConfig} from '../tlhXmlEditorConfig';

interface IProps {
  oldNode: XmlElementNode;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode) => void;
}

function readTransliteration(transliteration: string): Result<XmlElementNode> {
  // TODO: language!
  const word: Word = Word.parseWord(null, transliteration);

  return {status: true, value: word.exportXml()};
}

export function WordContentEditor({oldNode, /*initialTransliteration,*/ cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const initialTransliteration = oldNode.children.map((c, index) => reconstructTransliteration(c, index === 0)).join('');

  const [state, setState] = useState<Result<XmlElementNode>>(readTransliteration(initialTransliteration));

  function submitEdit() {
    state.status && updateNode(state.value);
  }

  function updateMorphologies(): void {
    if (!state.status) {
      alert('Can\'t query for morphological analyses!');
      return;
    }

    // FIXME: set language!
    fetchMorphologicalAnalyses(writeNode(state.value, tlhXmlEditorConfig.writeConfig).join(''), 'Hit')
      .then((res) => {
        if (res) {
          setState((state) => update(state, {value: {attributes: {$set: res}}}));
        } else {
          alert('Could not find any morphological analyses...');
        }
      })
      .catch((err) => console.error(err));
  }

  function copyMorphologicalAnalyses(): void {
    if (!state.status) {
      alert('TODO!');
      return;
    }

    setState((state) => update(state, {value: {attributes: {$set: oldNode.attributes}}}));
  }

  return (
    <div>
      <div className="flex">
        <label htmlFor="newTransliteration" className="p-2 rounded-l border-l border-y border-slate-500 font-bold">{t('newTransliteration')}:</label>

        <input defaultValue={initialTransliteration} className="flex-grow rounded-r border border-slate-500 p-2" id="newTransliteration"
               placeholder={t('newTransliteration') || 'newTransliteration'} onChange={(event) => setState(readTransliteration(event.target.value))}/>
      </div>

      <div className="mt-4 rounded-t">
        <div className={classNames('p-2', 'rounded-t', state.status ? 'bg-green-500' : 'bg-red-600', 'text-white', 'font-bold')}>{t('result')}</div>
        <div className={classNames('p-4', state.status ? 'bg-green-50' : 'bg-red-200')}>
          {state.status
            ? (
              <>
                <div className="p-2 rounded bg-white">
                  <NodeDisplay node={state.value} currentSelectedPath={undefined} isLeftSide={false}/>
                </div>
                <div className="mt-2 p-2 rounded bg-white">{writeNode(state.value, tlhXmlEditorConfig.writeConfig).join('')}</div>
              </>
            )
            : <pre>{JSON.stringify(state, null, 2)}</pre>
          }
        </div>
      </div>

      {state.status && <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="p-2 rounded bg-blue-600 text-white w-full" onClick={copyMorphologicalAnalyses} disabled={!state.status}>
          {t('copyMorphologicalAnalyses')}
        </button>
        <button type="button" className="p-2 rounded bg-blue-600 text-white w-full" onClick={updateMorphologies} disabled={!state.status}>
          {t('fetchMorphologicalAnalyses')}
        </button>
      </div>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={cancelEdit} className="p-2 rounded bg-amber-400">{t('cancelEdit')}</button>
        <button type="button" onClick={submitEdit} className="p-2 rounded bg-blue-600 text-white">{t('submitEdit')}</button>
      </div>
    </div>
  );
}