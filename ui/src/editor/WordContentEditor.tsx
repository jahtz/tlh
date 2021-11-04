import { useState } from 'react';
import {useTranslation} from 'react-i18next';
import {transliteration as transliterationLanguage} from '../transliterationParser/parser';
import {AOWordContent} from '../model/wordContent/wordContent';
import {xmlifyAoWord} from '../model/sentenceContent/word';
import {Result} from 'parsimmon';
import {GenericAttributes, XmlElementNode} from './xmlModel/xmlModel';
import {WordNodeAttributes} from './tlhEditorConfig';
import classNames from 'classnames';
import {fetchMorphologicalAnalyses} from '../model/morphologicalAnalysis';
import {NodeDisplay} from './NodeDisplay';
import {writeNode} from './xmlModel/xmlWriting';

export type WordNode = XmlElementNode<WordNodeAttributes & GenericAttributes>;

interface IProps {
  initialTransliteration: string;
  cancelEdit: () => void;
  updateNode: (node: WordNode) => void;
}

interface IState {
  parseResult: Result<WordNode>;
}

function readTransliteration(transliteration: string): IState {
  const parseResult: Result<AOWordContent[]> = transliterationLanguage.wordContents.parse(transliteration);

  return parseResult.status
    ? {parseResult: {status: true, value: xmlifyAoWord({content: parseResult.value})}}
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
          <input defaultValue={initialTransliteration} className="input" id="newTransliteration" placeholder={t('newTransliteration')}
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
                <NodeDisplay node={state.parseResult.value} currentSelectedPath={undefined}/>
              </div>
              <div className="box">{writeNode(state.parseResult.value).join('')}</div>
            </>
            : <pre>{JSON.stringify(state, null, 2)}</pre>
          }
        </div>
      </div>

      {state.parseResult.status && <>
        <button type="button" className="button is-link is-fullwidth" onClick={updateMorphologies} disabled>{t('fetchMorphologicalAnalyses')}</button>
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