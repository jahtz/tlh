import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {transliteration as transliterationLanguage} from '../transliterationParser/parser';
import {AOWordContent} from '../model/wordContent/wordContent';
import {WordContentDisplay} from '../manuscript/TransliterationLineResult';
import {AOWord, xmlifyAoWord} from '../model/sentenceContent/word';
import {Result} from 'parsimmon';
import {GenericAttributes, writeNode, XmlElementNode} from './xmlModel';
import {WordNodeAttributes} from './tlhNodeDisplayConfig';

interface IProps {
  initialTransliteration: string;
  cancelEdit: () => void;
  updateNode: (node: XmlElementNode<WordNodeAttributes & GenericAttributes>) => void;
}

interface IStateContent {
  content: AOWordContent[];
  xmlNode: XmlElementNode<WordNodeAttributes & GenericAttributes>;
}

type IState = Result<IStateContent>;

export function WordContentEditor({initialTransliteration, cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function readTransliteration(transliteration: string): Result<IStateContent> {
    const parseResult: Result<AOWordContent[]> = transliterationLanguage.wordContents.parse(transliteration);

    if (!parseResult.status) {
      return parseResult;
    }

    const word: AOWord = {type: 'AOWord', content: parseResult.value};

    return {
      status: true,
      value: {
        content: parseResult.value,
        xmlNode: xmlifyAoWord(word)
      }
    };
  }

  const [state, setState] = useState<IState>(readTransliteration(initialTransliteration));

  function update(newValue: string): void {
    setState(readTransliteration(newValue));
  }

  function submitEdit() {
    state.status && updateNode(state.value.xmlNode);
  }

  return (
    <>
      <div className="field">
        <label htmlFor="newTransliteration" className="label">{t('newTransliteration')}:</label>
        <div className="control">
          <input defaultValue={initialTransliteration} className="input" id="newTransliteration" onChange={(event) => update(event.target.value)}/>
        </div>
      </div>

      <hr/>

      {state.status
        ? <>
          <div className="box">
            {state.value.content.map((c, i) => <WordContentDisplay content={c} key={i}/>)}
          </div>
          <div className="box">{writeNode(state.value.xmlNode).join('')}</div>
        </>
        : <pre>{JSON.stringify(state, null, 2)}</pre>
      }

      <div className="columns my-3">
        <div className="column">
          <button onClick={cancelEdit} className="button is-warning is-fullwidth">{t('cancelEdit')}</button>
        </div>
        <div className="column">
          <button type="button" onClick={submitEdit} className="button is-link is-fullwidth">{t('submitEdit')}</button>
        </div>
      </div>
    </>
  );
}