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

interface TransliterationCheckState {
  _type: 'TransliterationCheck';
}

interface XmlCheckState {
  _type: 'XmlCheck';
  content: string;
}

interface AnnotatedXmlCheckState {
  _type: 'AnnotatedXmlCheck';
  content: string;
}

type IState = TransliterationCheckState | XmlCheckState | AnnotatedXmlCheckState;

function Inner({mainIdentifier, initialInput, initialIsConverted}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({_type: 'TransliterationCheck'});
  const [submitXmlConversion, {data, loading, error}] = useSubmitXmlConversionMutation();

  const converted = initialIsConverted || !!data?.reviewerMutations?.submitXmlConversion;

  const onSubmit = async (conversion: string) => {
    if (state._type === 'XmlCheck') {
      const response = await fetch('/TLHaly/deuteDokument.php', {
        method: 'POST',
        body: conversion,
        headers: {'Content-Type': 'application/xml*'}
      });

      const content = await response.text();

      setState({_type: 'AnnotatedXmlCheck', content});
    } else if (state._type === 'AnnotatedXmlCheck') {
      await submitXmlConversion({variables: {mainIdentifier, conversion}});
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
      {state._type === 'TransliterationCheck'
        ? <TransliterationCheck initialTransliteration={initialInput} onConvert={(content: string) => setState({_type: 'XmlCheck', content})}/>
        : <XmlCheck key={1} initialXml={state.content} annotated={state._type === 'AnnotatedXmlCheck'} loading={loading} onSubmit={onSubmit}/>
      }

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