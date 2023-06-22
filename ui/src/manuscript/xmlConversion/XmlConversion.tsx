import {JSX, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {useSubmitXmlConversionMutation, useXmlConversionQuery} from '../../graphql';
import {WithQuery} from '../../WithQuery';
import {useTranslation} from 'react-i18next';
import {TransliterationCheck} from './TransliterationCheck';
import {XmlCheck} from './XmlCheck';

interface IProps {
  mainIdentifier: string;
  initialInput: string;
}

function Inner({mainIdentifier, initialInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [xmlContent, setXmlContent] = useState<string>();
  const [submitXmlConversion, {data, loading, error}] = useSubmitXmlConversionMutation();

  const onSubmit = (conversion: string): Promise<void | undefined> =>
    submitXmlConversion({variables: {mainIdentifier, conversion}})
      .then(() => void 0)
      .catch((error) => console.error(error));

  if (data?.reviewerMutations?.submitXmlConversion) {
    return (
      <>
        <div className="my-4 p-2 rounded bg-green-500 text-white text-center">{t('xmlConversionPerformed')}</div>

        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </>
    );
  }

  return (
    <>
      {xmlContent === undefined
        ? <TransliterationCheck initialTransliteration={initialInput} onConvert={setXmlContent}/>
        : <XmlCheck initialXml={xmlContent} loading={loading} onSubmit={onSubmit}/>}

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}
    </>
  );
}

export function XmlConversion(): JSX.Element {

  const {t} = useTranslation('common');
  const mainIdentifier = useParams<'mainIdentifier'>().mainIdentifier;

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl}/>;
  }

  const xmlConversionQuery = useXmlConversionQuery({variables: {mainIdentifier}});

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('xmlConversion')}</h2>

      <WithQuery query={xmlConversionQuery}>
        {(data) =>
          data.reviewerQueries?.xmlConversion
            ? <Inner mainIdentifier={mainIdentifier} initialInput={data.reviewerQueries.xmlConversion}/>
            : <Navigate to={homeUrl}/>}
      </WithQuery>
    </div>
  );
}