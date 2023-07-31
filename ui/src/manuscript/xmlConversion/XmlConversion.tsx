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

interface IState {
  content: string;
  annotated: boolean;
}

function Inner({mainIdentifier, initialInput, initialIsConverted}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>();
  const [submitXmlConversion, {data, loading, error}] = useSubmitXmlConversionMutation();

  const converted = initialIsConverted || !!data?.reviewerMutations?.submitXmlConversion;

  const onSubmit = async (conversion: string) => {
    if (state !== undefined) {
      if (state.annotated) {
        await submitXmlConversion({variables: {mainIdentifier, conversion}});
      } else {
        // TODO: call annotation url...
        /*
        const response = await fetch('http://localhost:8077/deuteDokument.php', {
          method: 'POST',
          body: conversion,
          headers: {'Content-Type': 'application/xml*'}
        });

        const content = await response.text();

         */
        const content = conversion;

        setState({content, annotated: true});
      }
    }
  };

  if (converted) {
    return (
      <>
        <SuccessMessage><span>&#10004; {t('xmlConversionPerformed')}</span></SuccessMessage>

        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </>
    );
  }

  return (
    <>
      {state === undefined
        ? <TransliterationCheck initialTransliteration={initialInput} onConvert={(content: string) => setState({content, annotated: false})}/>
        : <XmlCheck initialXml={state.content} annotated={state.annotated} loading={loading} onSubmit={onSubmit}/>}

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}
    </>
  );
}

const xmlConverted = (status: ManuscriptStatus) => status !== ManuscriptStatus.Created
  && status !== ManuscriptStatus.TransliterationReleased
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