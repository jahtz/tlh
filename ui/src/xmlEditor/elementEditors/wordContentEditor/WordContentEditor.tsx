import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {XmlElementNode} from 'simple_xml';
import classNames from 'classnames';
import {reconstructTransliterationForWordNode} from '../../transliterationReconstruction';
import {ParagraphLanguageType, StatusLevel, Word} from 'simtex';
import {IResult, NewAbstractResult, NewNewError, NewNewOk} from '../../../newResult';
import {ParsedWord} from './ParsedWord';

interface IProps {
  oldNode: XmlElementNode<'w'>;
  language: string;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode<'w'>) => void;
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

type State = IResult<XmlElementNode<'w'>, string[]>;

function readTransliteration(transliteration: string, language: string): NewAbstractResult<XmlElementNode<'w'>, string[]> {
  const word = Word.parseWord(convertLangauge(language), transliteration);

  if (word instanceof Word) {
    return word.getStatus().getLevel() === StatusLevel.ok
      ? new NewNewOk(word.exportXml() as XmlElementNode<'w'>)
      : new NewNewError(word.getStatus().getEvents().map((event) => event.getMessage()));
  } else {
    return new NewNewError([]);
  }
}

export function WordContentEditor({oldNode, language, cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const {
    reconstruction: initialTransliteration,
    warnings: transliterationReconstructionWarnings
  } = reconstructTransliterationForWordNode(oldNode as XmlElementNode<'w'>);

  const [state, setState] = useState<State>(
    readTransliteration(initialTransliteration, language).toInterface()
  );

  return (
    <div>
      {transliterationReconstructionWarnings.length > 0 && <div className="my-4 p-2 rounded bg-red-600 text-white text-center">
        <p className="font-bold">{t('errorWhileTransliterationReconstruction')}:</p>
        <pre>{transliterationReconstructionWarnings}</pre>
      </div>}

      <div className="flex">
        <label htmlFor="newTransliteration" className="p-2 rounded-l border-l border-y border-slate-500 font-bold">
          {t('newTransliteration')} ({t('language')}: {language}):
        </label>

        <input defaultValue={initialTransliteration} className="flex-grow rounded-r border border-slate-500 p-2"
               id="newTransliteration" placeholder={t('newTransliteration') || 'newTransliteration'}
               onChange={(event) => setState(readTransliteration(event.target.value, language).toInterface())}/>
      </div>

      <div className="mt-4 rounded-t">
        <div className={classNames('p-2', 'rounded-t', state.status ? 'bg-green-500' : 'bg-red-600', 'text-white', 'font-bold')}>{t('result')}</div>
        <div className={classNames('p-4', state.status ? 'bg-green-50' : 'bg-red-200')}>
          {state.status
            ? <ParsedWord key={JSON.stringify(state.value)} oldNode={oldNode} initialParsedWord={state.value} language={language} submitEdit={updateNode}/>
            : <pre>{JSON.stringify(state, null, 2)}</pre>}
        </div>
      </div>

      <button type="button" onClick={cancelEdit} className="mt-4 p-2 rounded bg-amber-400 w-full">{t('cancelEdit')}</button>
    </div>
  );
}
