import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Result} from 'parsimmon';
import {writeNode, XmlElementNode} from 'simple_xml';
import classNames from 'classnames';
import {fetchMorphologicalAnalyses} from '../../model/morphologicalAnalysis';
import {NodeDisplay} from '../NodeDisplay';
import update from 'immutability-helper';
import {reconstructTransliterationForWordNode} from '../transliterationReconstruction';
import {ParagraphLanguageType, Word} from 'simtex';
import {tlhXmlEditorConfig} from '../tlhXmlEditorConfig';

interface IProps {
  oldNode: XmlElementNode;
  language: string;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode) => void;
}

const convertLangauge = (language: string): ParagraphLanguageType | null => {
  switch (language) {
    case 'Akk' :
      return ParagraphLanguageType.Akk;
    case 'Sum' :
      return ParagraphLanguageType.Sum;
    case 'Luw':
      return ParagraphLanguageType.Luw;
    case 'Pal':
      return ParagraphLanguageType.Pal;
    case 'Hur':
      return ParagraphLanguageType.Hur;
    case 'Hat':
      return ParagraphLanguageType.Hat;
    case 'Hit' :
      return ParagraphLanguageType.Hit;
    default:
      return null;
  }
};

function readTransliteration(transliteration: string, language: string): Result<XmlElementNode> {
  const word: Word = Word.parseWord(convertLangauge(language), transliteration);

  // FIXME: use status!
  const status = word.getStatus();

  return {status: true, value: word.exportXml()};
}

export function WordContentEditor({oldNode, language, cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const initialTransliteration = reconstructTransliterationForWordNode(oldNode);

  const [state, setState] = useState<Result<XmlElementNode>>(
    initialTransliteration.status
      ? readTransliteration(initialTransliteration.value, language)
      : {status: false, index: {line: -1, column: -1, offset: -1}, expected: []}
  );

  function submitEdit() {
    state.status && updateNode(state.value);
  }

  function updateMorphologies(): void {
    if (!state.status) {
      alert('Can\'t query for morphological analyses!');
      return;
    }

    fetchMorphologicalAnalyses(writeNode(state.value, tlhXmlEditorConfig.writeConfig).join(''), language)
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
      {!initialTransliteration.status && <div className="my-4 p-2 rounded bg-red-600 text-white text-center">
        <p className="font-bold">{t('errorWhileTransliterationReconstruction')}:</p>
        <pre>{initialTransliteration.error}</pre>
      </div>}

      <div className="flex">
        <label htmlFor="newTransliteration" className="p-2 rounded-l border-l border-y border-slate-500 font-bold">
          {t('newTransliteration')} ({t('language')}: {language}):
        </label>

        <input defaultValue={initialTransliteration.status ? initialTransliteration.value : ''} className="flex-grow rounded-r border border-slate-500 p-2"
               id="newTransliteration" placeholder={t('newTransliteration') || 'newTransliteration'}
               onChange={(event) => setState(readTransliteration(event.target.value, language))}/>
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