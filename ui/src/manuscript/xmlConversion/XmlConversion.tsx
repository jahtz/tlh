import {JSX, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../../urls';
import {ManuscriptStatus, useSubmitXmlConversionMutation, useXmlConversionQuery} from '../../graphql';
import {WithQuery} from '../../WithQuery';
import {useTranslation} from 'react-i18next';
import {TransliterationCheck} from './TransliterationCheck';
import {XmlCheck} from './XmlCheck';
import {SuccessMessage} from '../../designElements/Messages';

interface IProps {
  mainIdentifier: string;
  initialInput: string;
  initialIsConverted: boolean;
}

function Inner({mainIdentifier, initialInput, initialIsConverted}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [xmlContent, setXmlContent] = useState<string>();
  const [submitXmlConversion, {data, loading, error}] = useSubmitXmlConversionMutation();

  const onSubmit = (conversion: string) => submitXmlConversion({variables: {mainIdentifier, conversion}});

  const converted = initialIsConverted || !!data?.reviewerMutations?.submitXmlConversion;

  if (converted) {
    return (
      <>
        <SuccessMessage><span>&#10004;{t('xmlConversionPerformed')}</span></SuccessMessage>

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

const xmlConverted = (status: ManuscriptStatus) => status !== ManuscriptStatus.Created && status !== ManuscriptStatus.TransliterationReleased
  && status !== ManuscriptStatus.TransliterationReviewPerformed;

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
        {({manuscript}) =>
          manuscript?.xmlConversion
            ? <Inner mainIdentifier={mainIdentifier} initialInput={manuscript.xmlConversion} initialIsConverted={xmlConverted(manuscript.status)}/>
            : <Navigate to={homeUrl}/>}
      </WithQuery>
    </div>
  );
}