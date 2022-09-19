import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {ManuscriptIdentifierFragment} from '../graphql';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from '../newStore';
import {getNameForPalaeoClassification} from '../palaeoClassification';
import {createTransliterationUrl, ManuscriptBaseIProps, uploadPicturesUrl} from './ManuscriptBase';
import {PicturesBlock} from './PicturesBlock';
import {SideParseResult} from '../model/sideParseResult';
import {Transliteration} from './TransliterationLineResult';

export function ManuscriptData({manuscript}: ManuscriptBaseIProps): JSX.Element {

  const {t} = useTranslation('common');
  const activeUser: User | null = useSelector(activeUserSelector);

  const createdByUser: boolean = !!activeUser && activeUser.user_id === manuscript.creatorUsername;

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
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center">
        {t('manuscript{{mainIdentifier}}', {mainIdentifier: manuscript.mainIdentifier.identifier})}: {t('generalData_plural')}
      </h1>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('data_plural')}</h2>

        <table className="w-full">
          <tbody>
            <tr>
              <th className="text-right px-4 py-2">{t('otherIdentifier_plural')}</th>
              <td className="px-4 py-2">{renderOtherIdentifiers(manuscript.otherIdentifiers)}</td>
            </tr>
            <tr>
              <th className="text-right px-4 py-2">{t('palaeographicClassification')}</th>
              <td className="px-4 py-2">
                {getNameForPalaeoClassification(manuscript.palaeographicClassification, t)}
                {manuscript.palaeographicClassificationSure ? '' : '?'}
              </td>
            </tr>
            <tr>
              <th className="text-right px-4 py-2">{t('(proposed)CthClassification')}</th>
              <td className="px-4 py-2">{manuscript.cthClassification || '--'}</td>
            </tr>
            <tr>
              <th className="text-right px-4 py-2">{t('provenance')}</th>
              <td className="px-4 py-2">{manuscript.provenance || '--'}</td>
            </tr>
            <tr>
              <th className="text-right px-4 py-2">{t('bibliography')}</th>
              <td className="px-4 py-2">{manuscript.bibliography || '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('picture_plural')}</h2>

        {manuscript.pictureUrls.length === 0
          ? <div className="notification is-info has-text-centered">
            {t('noPicturesUploadedYet')}.
          </div>
          : <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={manuscript.pictureUrls}/>
        }

        {createdByUser && <Link className="mt-2 p-2 block rounded bg-blue-500 text-white text-center w-full" to={`../${uploadPicturesUrl}`}>
          {t('uploadPicture_plural')}
        </Link>}
      </div>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('transliteration')}</h2>

        {sideParseResults
          ? <div className="my-3">
            {sideParseResults.map(({lineResults}, index) => <Transliteration key={index} lines={lineResults}/>)}
          </div>
          : <div className="notification is-info has-text-centered">
            {t('noTransliterationCraetedYet')}.
          </div>}

        {createdByUser &&
          <Link className="mt-2 p-2 block rounded bg-blue-500 text-white text-center w-full" to={`../${createTransliterationUrl}`}>
            {t('createTransliteration')}
          </Link>}
      </div>
    </div>
  );
}
