import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {activeUserSelector} from '../newStore';
import {homeUrl} from '../urls';
import {
  ManuscriptMetaDataFragment,
  TransliterationColumnInput,
  TransliterationLineInput,
  TransliterationSideInput,
  useUploadTransliterationMutation
} from '../graphql';
import {defaultSideInput, SideInput, TransliterationSideInputDisplay} from './TransliterationSideInputDisplay';
import {Navigate, useLoaderData} from 'react-router-dom';
import update from 'immutability-helper';
import {LineParseResult} from './TransliterationColumnInputDisplay';

interface IState {
  sides: SideInput[];
}

const defaultState: IState = {
  sides: [defaultSideInput]
};

function convertLineParseResult2TransliterationLineInput(lineParseResult: LineParseResult, lineIndex: number): TransliterationLineInput {

  // FIXME: implement!
  throw new Error('TODO!');

  /*
  if (lineParseResult.type === 'LinePreParsingError' || lineParseResult.type === 'LineWordParsingError') {
    return {input: lineParseResult.input, lineIndex};
  }

  const {input, lineNumber} = lineParseResult;

  return {lineIndex, input, lineNumber, result: writeLineParseSuccessToXml(lineParseResult)};

   */
}

export function TransliterationInput(): JSX.Element {

  const manuscript = useLoaderData() as ManuscriptMetaDataFragment | undefined;

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>(defaultState);
  const currentUser = useSelector(activeUserSelector);

  const [uploadTransliteration, {/*data,*/ loading, error}] = useUploadTransliterationMutation();

  if (!manuscript || !currentUser || currentUser.user_id !== manuscript.creatorUsername) {
    return <Navigate to={homeUrl}/>;
  }

  const mainIdentifier = manuscript.mainIdentifier.identifier;

  /*
  if (data) {
    console.info(JSON.stringify(data, null, 2));
  }
   */

  function upload(): void {
    const values = state.sides.map<TransliterationSideInput>(({side, columns}, sideIndex) => ({
      sideIndex,
      side,
      columns: columns.map<TransliterationColumnInput>(({column, columnModifier, currentLineParseResult}, columnIndex) => ({
        columnIndex,
        column,
        columnModifier,
        lines: currentLineParseResult.map((lineParseResult, inputIndex) => convertLineParseResult2TransliterationLineInput(lineParseResult, inputIndex))
      }))
    }));

    uploadTransliteration({variables: {mainIdentifier, values}})
      .catch((error) => console.error('Could not upload transliteration:\n' + error));
  }

  const addTransliterationSideInput = (): void => setState((state) => update(state, {sides: {$push: [defaultSideInput]}}));

  return (
    <div className="container mx-auto">
      <h1 className="my-4 font-bold text-xl text-center">{t('createTransliteration')}</h1>

      {state.sides.map((sideInput, index) =>
        <TransliterationSideInputDisplay key={index}{...sideInput} updateSideInput={(spec) => setState((state) => update(state, {sides: {[index]: spec}}))}/>
      )}

      {error && <div className="mt-2 p-2 bg-red-500 text-white text-center">{error.message}</div>}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={addTransliterationSideInput}>{t('additionalPage')}</button>
        <button type="button" className="p-2 rounded bg-blue-500 text-white w-full" onClick={upload} disabled={loading}>{t('uploadTransliteration')}</button>
      </div>
    </div>
  );
}
