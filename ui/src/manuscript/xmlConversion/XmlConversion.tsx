import {ReactElement, useState} from 'react';
import {Link, Navigate, useParams} from 'react-router-dom';
import {homeUrl, tlhDocumentAnalyzerUrl} from '../../urls';
import {ManuscriptStatus, useSubmitXmlConversionMutation, useXmlConversionQuery} from '../../graphql';
import {WithQuery} from '../../WithQuery';
import {useTranslation} from 'react-i18next';
import {TransliterationCheck} from './TransliterationCheck';
import {XmlCheck} from './XmlCheck';
import {SuccessMessage} from '../../designElements/Messages';
import {isXmlElementNode, XmlNode} from 'simple_xml';
import {convertToXml, XmlCreationValues} from './convertToXml';
import {writeXml} from '../../xmlEditor/StandAloneOXTED';

interface IProps extends XmlCreationValues {
  initialInput: string;
  initialIsConverted: boolean;
}

type IState = { _type: 'TransliterationCheck'; } | { _type: 'XmlCheck'; content: string; } | { _type: 'AnnotatedXmlCheck'; content: string; };

const headers = {'Content-Type': 'application/xml*'};

// TODO: add other nodes to filter out...
const tagNamesToFilter = ['LINE_PREFIX', 'PARSER_ERROR', 'PUBLICATION_NUMBER', 'INVENTORY_NUMBER', 'IDENTIFIER', 'UNDEFINED_DEGREE_SIGN', 'LANGUAGE_CHANGE', 'GAP', 'DELIMITER', 'BASIC', 'METADATA'];

function Inner({mainIdentifier, mainIdentifierType, author, creationDate, transliterationReleaseDate, initialInput, initialIsConverted}: IProps): ReactElement {

  const {t} = useTranslation('common');
  const [state, setState] = useState<IState>({_type: 'TransliterationCheck'});
  const [submitXmlConversion, {data, loading, error}] = useSubmitXmlConversionMutation();

  const converted = initialIsConverted || !!data?.reviewerMutations?.submitXmlConversion;

  const onSubmit = async (conversion: string) => {
    if (state._type === 'XmlCheck') {
      const response = await fetch(tlhDocumentAnalyzerUrl, {method: 'POST', body: conversion, headers});
      const content = await response.text();
      setState({_type: 'AnnotatedXmlCheck', content});
    } else if (state._type === 'AnnotatedXmlCheck') {
      try {
        await submitXmlConversion({variables: {mainIdentifier, conversion}});
      } catch (exception) {
        console.error(exception);
      }
    }
  };

  const onConvert = (children: XmlNode[]): void => {

    // filter out "illegal nodes", like <LINE_PREFIX/>
    const filteredNodes = children.filter((node) => !isXmlElementNode(node) || !tagNamesToFilter.includes(node.tagName));

    const content = convertToXml(filteredNodes, {mainIdentifier, mainIdentifierType, author, creationDate, transliterationReleaseDate});

    setState({_type: 'XmlCheck', content: writeXml(content)});
  };

  return converted
    ? (
      <>
        <SuccessMessage><span>&#10004; {t('xmlConversionPerformed')}</span></SuccessMessage>
        <Link to={homeUrl} className="p-2 block rounded bg-blue-500 text-white text-center">{t('backToHome')}</Link>
      </>
    ) : (
      <>
        {state._type === 'TransliterationCheck'
          ? <TransliterationCheck initialTransliteration={initialInput} onConvert={onConvert}/>
          : <XmlCheck key={state._type} initialXml={state.content} annotated={state._type === 'AnnotatedXmlCheck'} loading={loading} onSubmit={onSubmit}/>}
        {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}
      </>
    );
}

const xmlConverted = (status: ManuscriptStatus) => status !== ManuscriptStatus.Created
  && status !== ManuscriptStatus.TransliterationReleased
  && status !== ManuscriptStatus.TransliterationReviewPerformed;

export function XmlConversion(): ReactElement {

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
        {({manuscript}) => {

          if (!manuscript || !manuscript.xmlConversionData || !manuscript.transliterationReleaseDate) {
            return <Navigate to={homeUrl}/>;
          }

          const {author, creationDate, xmlConversionData, status, transliterationReleaseDate} = manuscript;

          return (
            <Inner mainIdentifier={mainIdentifier} mainIdentifierType={manuscript.mainIdentifier.mainIdentifierType} author={author} creationDate={creationDate}
                   transliterationReleaseDate={transliterationReleaseDate} initialInput={xmlConversionData} initialIsConverted={xmlConverted(status)}/>
          );
        }}
      </WithQuery>
    </div>
  );
}