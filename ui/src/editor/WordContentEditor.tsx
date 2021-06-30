import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {transliteration} from '../transliterationParser/parser';
import {AOWordContent} from '../model/wordContent/wordContent';
import {WordComponent} from '../manuscript/TransliterationLineResult';
import {AOWord} from '../model/sentenceContent/word';

interface IProps {
  initialTransliteration: string;
  cancelEdit: () => void;
}

export function WordContentEditor({initialTransliteration, cancelEdit}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const initialParsedValue = transliteration.wordContents.parse(initialTransliteration);

  if (!initialParsedValue.status) {
    return <pre>{JSON.stringify(initialParsedValue, null, 2)}</pre>;
  }

  const [content, setContent] = useState<AOWordContent[]>(initialParsedValue.value);

  function update(newValue: string): void {
    console.info(newValue);

    const newResult = transliteration.wordContents.parse(newValue.trim());

    setContent(newResult.status ? newResult.value : []);
  }

  const word: AOWord = {type: 'AOWord', content};

  return (
    <>
      <div className="field">
        <label htmlFor="newTransliteration" className="label">{t('newTransliteration')}:</label>
        <div className="control">
          <input defaultValue={initialTransliteration} className="input" id="newTransliteration" onChange={(event) => update(event.target.value)}/>
        </div>
      </div>

      <div className="box">
        <WordComponent word={word}/>
      </div>

      <div className="columns my-3">
        <div className="column">
          <button onClick={cancelEdit} className="button is-warning is-fullwidth">{t('cancelEdit')}</button>
        </div>
        <div className="column">
          <button type="button" onClick={() => void 0} className="button is-link is-fullwidth">{t('submitEdit')}</button>
        </div>
      </div>
    </>
  );
}