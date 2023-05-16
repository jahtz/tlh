import {JSX, useState} from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {homeUrl} from '../urls';
import {useSubmitXmlConversionMutation, useXmlConversionQuery} from '../graphql';
import {WithQuery} from '../WithQuery';
import {TransliterationTextArea} from './TransliterationTextArea';
import {useTranslation} from 'react-i18next';
import {TLHParser} from 'simtex';
import {convertLine, filterResults} from './LineParseResult';

interface IProps {
  mainIdentifier: string;
  initialInput: string;
}

function Inner({/* mainIdentifier, */ initialInput}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [input, setInput] = useState(initialInput);
  const [submitXmlConversion, {loading, error}] = useSubmitXmlConversionMutation();

  const onConvert = (): void => {
    console.info('TODO!');
  };

  const onSubmit = (): void => {
    // FIXME: check all lines are ok...
    const x = new TLHParser(input)
      .getLines()
      .map(convertLine);

    const filteredResults = filterResults(x);

    if (filteredResults.status) {
      const nodes = filteredResults.value;
      console.info(JSON.stringify(nodes, null, 2));
    } else {
      filteredResults.error.forEach((err) => console.error(error));
    }
  };

  return (
    <div className="container mx-auto">
      <h2 className="font-bold text-xl text-center">{t('xmlConversion')}</h2>

      <TransliterationTextArea input={input} onChange={setInput}/>

      {error && <div className="my-2 p-2 rounded bg-red-500 text-white text-center w-full">{error.message}</div>}

      <button type="button" onClick={onSubmit} disabled={loading} className="my-2 p-2 rounded bg-blue-500 text-white w-full disabled:opacity-50">
        {t('submit')}
      </button>
    </div>
  );
}

export function XmlConversion(): JSX.Element {

  const mainIdentifier = useParams<'mainIdentifier'>().mainIdentifier;

  if (mainIdentifier === undefined) {
    console.error('No id!');
    return <Navigate to={homeUrl}/>;
  }

  const xmlConversionQuery = useXmlConversionQuery({variables: {mainIdentifier}});

  return (
    <WithQuery query={xmlConversionQuery}>
      {(data) =>
        data.reviewerQueries?.xmlConversion
          ? <Inner mainIdentifier={mainIdentifier} initialInput={data.reviewerQueries.xmlConversion}/>
          : <Navigate to={homeUrl}/>}
    </WithQuery>
  );
}