import {useTranslation} from 'react-i18next';
import {JSX, useState} from 'react';
import {Link, Navigate, useLoaderData} from 'react-router-dom';
import {ManuscriptMetaDataFragment, ManuscriptStatus, useReleaseTransliterationMutation} from '../graphql';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from '../newStore';
import {getNameForPalaeoClassification} from '../model/manuscriptProperties/palaeoClassification';
import {PicturesBlock} from './PicturesBlock';
import {createTransliterationUrl, homeUrl, uploadPicturesUrl} from '../urls';
import {TLHParser} from 'simtex';
import {convertLine} from './LineParseResult';
import {TransliterationParseResultDisplay} from './ColumnParseResultComponent';
import {getNameForManuscriptLanguageAbbreviation} from '../forms/manuscriptLanguageAbbreviations';
import update from 'immutability-helper';

const buttonClasses = (color: string): string => `p-2 block rounded bg-${color}-500 text-white text-center w-full`;

export function ManuscriptData(): JSX.Element {

  const initialManuscript = useLoaderData() as ManuscriptMetaDataFragment | undefined;

  const {t} = useTranslation('common');
  const activeUser: User | null = useSelector(activeUserSelector);
  const [releaseTransliteration] = useReleaseTransliterationMutation();

  const [manuscript, setManuscript] = useState(initialManuscript);

  if (!manuscript) {
    return <Navigate to={homeUrl}/>;
  }

  const createdByUser: boolean = !!activeUser && activeUser.sub === manuscript.creatorUsername;

  const parsedTransliteration = manuscript.provisionalTransliteration !== undefined && manuscript.provisionalTransliteration !== null
    ? new TLHParser(manuscript.provisionalTransliteration).getLines().map(convertLine)
    : undefined;

  const mainIdentifier = manuscript.mainIdentifier.identifier;
  
  const onReleaseTransliteration = (): void => {
    if (manuscript.transliterationReleased) {
      return;
    }

    releaseTransliteration({variables: {mainIdentifier}})
      .then(({data}) => {
        if (data?.me?.manuscript?.releaseTransliteration) {
          setManuscript((manuscript) => update(manuscript, {
            transliterationReleased: {$set: true},
            status: {$set: ManuscriptStatus.TransliterationReleased}
          }));
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="container mx-auto">
      <h1 className="font-bold text-2xl text-center">
        {t('manuscript')} {mainIdentifier}: {t('generalData_plural')}
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
                  : <ul className="content">
                    {manuscript.otherIdentifiers.map(({identifier, identifierType}) => <li key={identifier}>{identifier} ({identifierType})</li>)}
                  </ul>}
              </td>
            </tr>
            <tr>
              <th className="text-right px-4 py-2">{t('defaultLanguage')}</th>
              <td className="px-4 py-2">{getNameForManuscriptLanguageAbbreviation(manuscript.defaultLanguage, t)}</td>
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
            <tr>
              <th className="text-right px-4 py-2">{t('status')}</th>
              <td className="px-4 py-2">{manuscript.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('picture_plural')}</h2>

        {manuscript.pictureUrls.length === 0
          ? <div className="my-4 italic text-cyan-500 text-center">{t('noPicturesUploadedYet')}.</div>
          : <PicturesBlock mainIdentifier={manuscript.mainIdentifier.identifier} pictures={manuscript.pictureUrls}/>
        }

        {createdByUser && <Link className={buttonClasses('blue')} to={`../${uploadPicturesUrl}`}>{t('uploadPicture_plural')}</Link>}
      </div>

      <div className="my-3">
        <h2 className="font-bold text-xl">{t('transliteration')}</h2>

        {parsedTransliteration !== undefined
          ? (
            <div className="my-3">
              <TransliterationParseResultDisplay showStatusLevel={false} lines={parsedTransliteration}/>
            </div>
          )
          : <div className="my-4 p-2 italic text-cyan-500 text-center">{t('noTransliterationCreatedYet')}.</div>}

        {createdByUser && !manuscript.transliterationReleased &&
          <div className="space-x-2">
            {parsedTransliteration !== undefined
              ? (
                <div className="my-2 grid grid-cols-2 gap-2">
                  <Link className={buttonClasses('blue')} to={`../${createTransliterationUrl}`}>{t('updateTransliteration')}</Link>
                  <button type="button" className={buttonClasses('green')} onClick={onReleaseTransliteration}>{t('releaseTransliteration')}</button>
                </div>
              )
              : <Link className={buttonClasses('blue')} to={`../${createTransliterationUrl}`}>{t('createTransliteration')}</Link>}
          </div>}
      </div>
    </div>
  );
}
