import React from 'react';
import {Redirect, Route, Switch, useRouteMatch} from 'react-router-dom';
import {ManuscriptData} from './ManuscriptData';
import {ManuscriptMetaDataFragment, ManuscriptQuery, useManuscriptQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {homeUrl} from '../urls';
import {UploadPicturesForm} from './UploadPicturesForm';
import {TransliterationInput} from './TransliterationInput';
import {NotFound} from '../NotFound';

export interface ManuscriptBaseIProps {
  manuscript: ManuscriptMetaDataFragment;
}

export const uploadPicturesUrl = 'uploadPictures';
export const createTransliterationUrl = 'createTransliteration';

// URL: /manuscripts/:mainIdentifier
export function ManuscriptBase(): JSX.Element {

  const {url, params} = useRouteMatch<{ mainIdentifier: string; }>();
  const mainIdentifier = decodeURIComponent(params.mainIdentifier);
  const manuscriptQuery = useManuscriptQuery({variables: {mainIdentifier}});

  function render({manuscript: m}: ManuscriptQuery): JSX.Element {
    if (!m) {
      return <Redirect to={homeUrl}/>;
    }

    return (
      <Switch>
        <Route path={`${url}/data`} render={() => <ManuscriptData manuscript={m}/>}/>
        <Route path={`${url}/${uploadPicturesUrl}`} render={() => <UploadPicturesForm manuscript={m}/>}/>
        <Route path={`${url}/${createTransliterationUrl}`} render={() => <TransliterationInput manuscript={m}/>}/>
        <Route component={NotFound}/>
      </Switch>
    );
  }

  return <WithQuery query={manuscriptQuery} render={render}/>;
}