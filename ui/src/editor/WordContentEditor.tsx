import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {transliteration as transliterationLanguage} from '../transliterationParser/parser';
import {AOWordContent} from '../model/wordContent/wordContent';
import {xmlifyAoWord} from '../model/sentenceContent/word';
import {Result} from 'parsimmon';
import {GenericAttributes, writeNode, XmlElementNode} from './xmlModel';
import {WordNodeAttributes} from './tlhNodeDisplayConfig';
import classNames from 'classnames';
import {fetchMorphologicalAnalyses} from '../model/morphologicalAnalysis';
import {DisplayNode} from './NodeDisplay';

export type WordNode = XmlElementNode<WordNodeAttributes & GenericAttributes>;

interface IProps {
  initialTransliteration: string;
  cancelEdit: () => void;
  updateNode: (node: WordNode) => void;
}

interface IState {
  parseResult: Result<WordNode>;
}

export function WordContentEditor({initialTransliteration, cancelEdit, updateNode}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  function readTransliteration(transliteration: string): IState {
    const parseResult: Result<AOWordContent[]> = transliterationLanguage.wordContents.parse(transliteration);

    return parseResult.status
      ? {parseResult: {status: true, value: xmlifyAoWord({content: parseResult.value})}}
      : {parseResult};
  }

  const [state, setState] = useState<IState>(readTransliteration(initialTransliteration));

  function submitEdit() {
    state.parseResult.status && updateNode(state.parseResult.value);
  }

  function updateMorhpologies(): void {
    if (state.parseResult.status) {
      fetchMorphologicalAnalyses(writeNode(state.parseResult.value).join(''), 'Hit')
        .then((res) => {
          console.info(JSON.stringify(res, null, 2));

          if (res) {
            setState({parseResult: {status: true, value: res}});
          }
        })
        .catch((err) => console.error(err));
    }
  }

  return (
    <>
      <div className="field">
        <label htmlFor="newTransliteration" className="label">{t('newTransliteration')}:</label>
        <div className="control">
          <input defaultValue={initialTransliteration} className="input" id="newTransliteration"
                 onChange={(event) => setState(readTransliteration(event.target.value))}/>
        </div>
      </div>

      <hr/>

      <div className={classNames('message', state.parseResult.status ? 'is-success' : 'is-danger')}>
        <div className="message-header">{t('result')}</div>
        <div className="message-body">
          {state.parseResult.status
            ? <>
              <div className="box">
                <DisplayNode node={state.parseResult.value} currentSelectedPath={undefined} path={[]}/>
              </div>
              <div className="box">{writeNode(state.parseResult.value).join('')}</div>
            </>
            : <pre>{JSON.stringify(state, null, 2)}</pre>
          }
        </div>
      </div>

      {state.parseResult.status && <>
        <button type="button" className="button is-link is-fullwidth" onClick={updateMorhpologies}>{t('fetchMorphologicalAnalyses')}</button>
      </>}

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