import React, {useState} from 'react';
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";
import {activeUserSelector} from "../store/store";
import {homeUrl} from "../urls";
import {Redirect} from 'react-router-dom';
import {TransliterationInput as TI, useUploadTransliterationMutation} from "../generated/graphql";
import {ManuscriptBaseIProps} from "./ManuscriptBase";
import {TransliterationSideInput} from "./TransliterationSideInput";

interface SideParseResultContainer {
  newSideParseResult?: TI;
}

interface IState {
  sideParseResults: SideParseResultContainer[];
}

export function TransliterationInput({manuscript}: ManuscriptBaseIProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({sideParseResults: [{}]})
  const currentUser = useSelector(activeUserSelector);

  const [uploadTransliteration, {data, loading, error}] = useUploadTransliterationMutation();

  const mainIdentifier = manuscript.mainIdentifier.identifier;

  if (!currentUser || currentUser.username !== manuscript.creatorUsername) {
    return <Redirect to={homeUrl}/>;
  }

  if (!!data) {
    console.info(JSON.stringify(data, null, 2));
  }

  function upload(): void {
    const values = state.sideParseResults.flatMap(({newSideParseResult}) => newSideParseResult ? [newSideParseResult] : []);

    uploadTransliteration({variables: {mainIdentifier, values}})
      .catch((error) => console.error('Could not upload transliteration:\n' + error));
  }

  function addTransliterationSideInput(): void {
    setState((state) => {
      return {...state, sideParseResults: [...state.sideParseResults, {}]}
    })
  }

  function updateTransliteration(index: number, result: TI): void {
    setState((state) => {
      return {
        ...state,
        sideParseResults: state.sideParseResults
          .map((sprc, runningIndex) => index === runningIndex ? {newSideParseResult: result} : sprc),
      }
    });
  }

  return (
    <div className="container is-fluid">
      <h1 className="subtitle is-3 has-text-centered">{t('createTransliteration')}</h1>

      {state.sideParseResults.map((_, index) =>
        <TransliterationSideInput
          key={index} mainIdentifier={mainIdentifier}
          onTransliterationUpdate={(s) => updateTransliteration(index, s)}/>
      )}

      <div className="columns">
        <div className="column">
          <button className="button is-link is-fullwidth" onClick={addTransliterationSideInput}>
            {t('additionalPage')}
          </button>
        </div>
        <div className="column">
          <button type="button" className="button is-link is-fullwidth" onClick={upload} disabled={loading}>
            {t('uploadTransliteration')}
          </button>

          {error && <div className="notification is-danger has-text-centered my-3">{error.message}</div>}
        </div>
      </div>
    </div>
  );
}
