import {useTranslation} from 'react-i18next';
import {Link, Navigate, useLoaderData} from 'react-router-dom';
import {ManuscriptMetaDataFragment} from '../graphql';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from '../newStore';
import {getNameForPalaeoClassification} from '../model/manuscriptProperties/palaeoClassification';
import {PicturesBlock} from './PicturesBlock';
import {createTransliterationUrl, homeUrl, uploadPicturesUrl} from '../urls';
import {TLHParser} from 'simtex';
import {convertLine} from './LineParseResult';
import {TransliterationParseResultDisplay} from './ColumnParseResultComponent';

export function ManuscriptData(): JSX.Element {

  const {t} = useTranslation('common');
  const activeUser: User | null = useSelector(activeUserSelector);

  const manuscript = useLoaderData() as ManuscriptMetaDataFragment | undefined;

  if (!manuscript) {
    return <Navigate to={homeUrl}/>;
  }

  const createdByUser: boolean = !!activeUser && activeUser.user_id === manuscript.creatorUsername;

  const parsedTransliteration = manuscript.provisionalTransliteration !== undefined && manuscript.provisionalTransliteration !== null
    ? new TLHParser(manuscript.provisionalTransliteration).getLines().map(convertLine)
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
              <td className="px-4 py-2">
                {manuscript.otherIdentifiers.length === 0
                  ? <span className="italic">{t('noOtherIdentifiersFound')}.</span>
                  : (
                    <div className="content">
                      <ul>
                        {manuscript.otherIdentifiers.map(({identifier, identifierType}) => <li key={identifier}>{identifier} ({identifierType})</li>)}
                      </ul>
                    </div>
                  )}
              </td>
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
          ? (
            <div className="notification is-info has-text-centered">
              {t('noPicturesUploadedYet')}.
            </div>
          )
          : <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={manuscript.pictureUrls}/>
        }

        {createdByUser && <Link className="mt-2 p-2 block rounded bg-blue-500 text-white text-center w-full" to={`../${uploadPicturesUrl}`}>
          {t('uploadPicture_plural')}
        </Link>}
      </div>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('transliteration')}</h2>

        {parsedTransliteration !== undefined
          ? (
            <div className="my-3">
              <TransliterationParseResultDisplay showStatusLevel={false} lines={parsedTransliteration}/>
            </div>
          )
          : <div className="notification is-info has-text-centered">{t('noTransliterationCreatedYet')}.</div>}

        {createdByUser &&
          <Link className="mt-2 p-2 block rounded bg-blue-500 text-white text-center w-full" to={`../${createTransliterationUrl}`}>
            {t('createTransliteration')}
          </Link>}
      </div>
    </div>
  );
}
