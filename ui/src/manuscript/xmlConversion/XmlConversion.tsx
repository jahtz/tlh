import { ReactElement, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { homeUrl, tlhDocumentAnalyzerUrl } from '../../urls';
import { ManuscriptStatus, useSubmitXmlConversionMutation, useXmlConversionQuery } from '../../graphql';
import { WithQuery } from '../../WithQuery';
import { useTranslation } from 'react-i18next';
import { TransliterationCheck } from './TransliterationCheck';
import { XmlCheck } from './XmlCheck';
import { SuccessMessage } from '../../designElements/Messages';
import { XmlCreationValues } from './createCompleteDocument';
import { TLHParser } from 'simtex';
import { exportXmlFromParser } from '../exportFromParser';

interface IProps extends XmlCreationValues {
  initialInput: string;
  initialIsConverted: boolean;
}

type IState = { _type: 'TransliterationCheck'; }
  | { _type: 'XmlCheck'; content: string; }
  | { _type: 'AnnotatedXmlCheck'; content: string; };

const headers: HeadersInit = { 'Content-Type': 'application/xml*' };

function Inner({ initialInput, initialIsConverted, ...xmlCreationValues }: IProps): ReactElement {

  const { t } = useTranslation('common');
  const [state, setState] = useState<IState>({ _type: 'TransliterationCheck' });
  const [submitXmlConversion, { data, loading, error }] = useSubmitXmlConversionMutation();

  const converted = initialIsConverted || !!data?.reviewerMutations?.submitXmlConversion;

  const onSubmit = async (conversion: string): Promise<void> => {
    try {
      if (state._type === 'XmlCheck') {
        const response = await fetch(tlhDocumentAnalyzerUrl, { method: 'POST', body: conversion, headers });
        const content = await response.text();
        setState({ _type: 'AnnotatedXmlCheck', content });
      } else if (state._type === 'AnnotatedXmlCheck') {
        await submitXmlConversion({ variables: { mainIdentifier: xmlCreationValues.mainIdentifier, conversion } });
      }
    } catch (exception) {
      console.error(exception);
    }
  };

  const onConvert = (input: string): void => setState({ _type: 'XmlCheck', content: exportXmlFromParser(new TLHParser(input), xmlCreationValues) });

  return converted
    ? (
      <>
        <SuccessMessage><span>&#10004; {t('xmlConversionPerformed')}</span></SuccessMessage>
        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </>
    ) : (
      <>
        {state._type === 'TransliterationCheck'
          ? <TransliterationCheck xmlCreationValues={xmlCreationValues} initialTransliteration={initialInput} onConvert={onConvert} />
          : <XmlCheck key={state._type} initialXml={state.content} annotated={state._type === 'AnnotatedXmlCheck'} loading={loading} onSubmit={onSubmit} />}
        {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}
      </>
    );
}

const xmlConverted = (status: ManuscriptStatus) => status !== ManuscriptStatus.Created
  && status !== ManuscriptStatus.TransliterationReleased
  && status !== ManuscriptStatus.TransliterationReviewPerformed;

export function XmlConversion(): ReactElement {

  const { t } = useTranslation('common');
  const mainIdentifier = useParams<'mainIdentifier'>().mainIdentifier;

  if (mainIdentifier === undefined) {
    return <Navigate to={homeUrl} />;
  }

  const xmlConversionQuery = useXmlConversionQuery({ variables: { mainIdentifier } });

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('xmlConversion')}</h2>

      <WithQuery query={xmlConversionQuery}>
        {({ manuscript }) => {

          if (!manuscript || !manuscript.xmlConversionData || !manuscript.transliterationReleaseDate) {
            return <Navigate to={homeUrl} />;
          }

          const { author, creationDate, lang, xmlConversionData, status, transliterationReleaseDate } = manuscript;

          return (
            <Inner mainIdentifier={mainIdentifier} mainIdentifierType={manuscript.mainIdentifier.mainIdentifierType} author={author} creationDate={creationDate}
              transliterationReleaseDate={transliterationReleaseDate} lang={lang} initialInput={xmlConversionData} initialIsConverted={xmlConverted(status)} />
          );
        }}
      </WithQuery>
    </div>
  );
}