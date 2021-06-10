import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {LoggedInUserFragment, ManuscriptIdentifierFragment} from '../generated/graphql';
import {useSelector} from 'react-redux';
import {activeUserSelector} from '../store/store';
import {getNameForPalaeoClassification} from '../palaeoClassification';
import {createTransliterationUrl, ManuscriptBaseIProps, uploadPicturesUrl} from './ManuscriptBase';
import {PicturesBlock} from './PicturesBlock';
import {transliteration} from '../transliterationParser/parser';
import {SideParseResult} from '../model/sideParseResult';
import {Transliteration} from './TransliterationLineResult';

export function ManuscriptData({manuscript}: ManuscriptBaseIProps): JSX.Element {

  const {t} = useTranslation('common');
  const activeUser: LoggedInUserFragment | undefined = useSelector(activeUserSelector);

  const createdByUser: boolean = !!activeUser && activeUser.username === manuscript.creatorUsername;

  function renderOtherIdentifiers(otherIdentifiers: ManuscriptIdentifierFragment[]): JSX.Element {
    if (otherIdentifiers.length === 0) {
      return <span className="is-italic">{t('Keine weiteren Identfikatoren gefunden')}.</span>;
    }

    return (
      <div className="content">
        <ul>
          {otherIdentifiers.map(({identifier, identifierType}) =>
            <li key={identifier}>{identifier} ({identifierType})</li>
          )}
        </ul>
      </div>
    );
  }

  const sideParseResults: SideParseResult[] | undefined = manuscript.transliterations
    ? manuscript.transliterations.map(({resultJson}) => JSON.parse(resultJson) as SideParseResult)
    : undefined;

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">
        {t('manuscript{{mainIdentifier}}', {mainIdentifier: manuscript.mainIdentifier.identifier})}: {t('generalData_plural')}
      </h1>

      <div className="my-3">
        <h2 className="subtitle is-4">{t('data_plural')}</h2>

        <table className="table is-fullwidth">
          <tbody>
            <tr>
              <th>{t('otherIdentifier_plural')}</th>
              <td>{renderOtherIdentifiers(manuscript.otherIdentifiers)}</td>
            </tr>
            <tr>
              <th>{t('palaeographicClassification')}</th>
              <td>
                {getNameForPalaeoClassification(manuscript.palaeographicClassification, t)}
                {manuscript.palaeographicClassificationSure ? '' : '?'}
              </td>
            </tr>
            <tr>
              <th>{t('(proposed)CthClassification')}</th>
              <td>{manuscript.cthClassification || '--'}</td>
            </tr>
            <tr>
              <th>{t('provenance')}</th>
              <td>{manuscript.provenance || '--'}</td>
            </tr>
            <tr>
              <th>{t('bibliography')}</th>
              <td>{manuscript.bibliography || '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-3">
        <h2 className="subtitle is-4">{t('picture_plural')}</h2>

        {manuscript.pictureUrls.length === 0
          ? <div className="notification is-info has-text-centered">
            {t('noPicturesUploadedYet')}.
          </div>
          : <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={manuscript.pictureUrls}/>
        }

        {createdByUser && <Link className="button is-link is-fullwidth" to={`./${uploadPicturesUrl}`}>
          {t('uploadPicture_plural')}
        </Link>}
      </div>

      <div className="my-3">
        <h2 className="subtitle is-4">{t('transliteration')}</h2>

        {sideParseResults
          ? <div className="my-3">
            {sideParseResults.map(({lineResults}, index) => <Transliteration key={index} lines={lineResults}/>)}
          </div>
          : <div className="notification is-info has-text-centered">
            {t('noTransliterationCraetedYet')}.
          </div>}

        {createdByUser &&
        <Link className="button is-link is-fullwidth" to={`./${createTransliterationUrl}`}>
          {t('createTransliteration')}
        </Link>}
      </div>
    </div>
  );
}
