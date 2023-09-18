import {ChangeEvent, ReactElement, useState} from 'react';
import {xmlElementNode, XmlElementNode, XmlNode} from 'simple_xml';
import {readTransliteration, WordContentEditState} from './WordContentEditor';
import {useTranslation} from 'react-i18next';
import {reconstructTransliterationForNodes} from '../../transliterationReconstruction';
import {inputClasses, redMessageClasses} from '../../../defaultDesign';
import update from 'immutability-helper';
import {myOk} from '../../../newResult';

interface IProps {
  preLbContent: XmlNode[];
  lbNode: XmlElementNode;
  postLbContent: XmlNode[];
  language: string;
  onNewParseResult: (result: WordContentEditState) => void;
}

interface IState {
  preLbParseResult: WordContentEditState;
  postLbParseResult: WordContentEditState;
}

export function WordWithLbContentEditor({preLbContent, lbNode, postLbContent, language, onNewParseResult}: IProps): ReactElement {

  const {t} = useTranslation('common');

  const {reconstruction: preRecon, warnings: preWarnings} = reconstructTransliterationForNodes(preLbContent);
  const {reconstruction: postRecon, warnings: postWarnings} = reconstructTransliterationForNodes(postLbContent);

  const [state, setState] = useState<IState>({
    preLbParseResult: readTransliteration(preRecon, language),
    postLbParseResult: readTransliteration(postRecon, language)
  });

  const onPartChanged = (preLbParseResult: WordContentEditState, postLbParseResult: WordContentEditState): void => {
    if (preLbParseResult.status && postLbParseResult.status) {
      const newChildren = [...preLbParseResult.value.children, lbNode, ...postLbParseResult.value.children];

      onNewParseResult(myOk(xmlElementNode('w', {}, newChildren)));
    } else {
      console.info(preLbParseResult.status + ' :: ' + postLbParseResult.status);
    }
  };

  const onPreLbChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const preLbParseResult = readTransliteration(event.target.value, language);

    const {postLbParseResult} = state;

    setState((state) => update(state, {preLbParseResult: {$set: preLbParseResult}}));

    onPartChanged(preLbParseResult, postLbParseResult);
  };

  const onPostLbChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const postLbParseResult = readTransliteration(event.target.value, language);

    const {preLbParseResult} = state;

    setState((state) => update(state, {postLbParseResult: {$set: postLbParseResult}}));

    onPartChanged(preLbParseResult, postLbParseResult);
  };

  return (
    <>
      <div className="my-4">
        {preWarnings.length > 0 && <div className={redMessageClasses}>
          <p className="font-bold">{t('errorWhileTransliterationReconstruction')}:</p>
          <pre>{preWarnings}</pre>
        </div>}

        <label htmlFor="newPreLbTransliteration" className="font-bold">{t('newPreLbTransliteration')} ({t('language')}: {language}):</label>

        <input defaultValue={preRecon} id="newPreTransliteration" className={inputClasses(true, !state.preLbParseResult.status)}
               placeholder={t('newPreLbTransliteration')} onChange={onPreLbChange}/>
      </div>

      <div className="my-4">
        {postWarnings.length > 0 && <div className={redMessageClasses}>
          <p className="font-bold">{t('errorWhileTransliterationReconstruction')}:</p>
          <pre>{postWarnings}</pre>
        </div>}

        <label htmlFor="newPostLbTransliteration" className="font-bold">{t('newPostLbTransliteration')} ({t('language')}: {language}):</label>

        <input defaultValue={postRecon} id="newPostLbTransliteration" className={inputClasses(true, !state.postLbParseResult.status)}
               placeholder={t('newPostLbTransliteration')} onChange={onPostLbChange}/>
      </div>
    </>
  );
}