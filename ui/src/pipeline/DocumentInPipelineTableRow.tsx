import {
  DocumentInPipelineFragment,
  useAppointFirstXmlReviewerMutation,
  useAppointSecondXmlReviewerMutation,
  useAppointTransliterationReviewerMutation,
  useAppointXmlConverterMutation
} from '../graphql';
import {JSX} from 'react';
import {UserSelect} from './UserSelect';

interface IProps extends DocumentInPipelineFragment {
  allReviewers: string[];
}

const formatDate = (value: string): string => new Date(value)
  .toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});

function DateCheckMark({date}: { date: string | undefined }): JSX.Element {
  return date !== undefined
    ? <span>&#x2714; ({date})</span>
    : <span>&#x2718;</span>;
}

function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (value) {
    return value;
  } else {
    throw new Error(message);
  }
}

export function DocumentInPipelineTableRow({
  allReviewers,
  manuscriptIdentifier,
  transliterationReviewDateString,
  appointedTransliterationReviewer,
  appointedXmlConverter,
  xmlConversionDateString,
  appointedFirstXmlReviewer,
  firstXmlReviewDateString,
  appointedSecondXmlReviewer,
  secondXmlReviewDateString
}: IProps): JSX.Element {

  const [executeAppointTransliterationReviewer, {loading: executeAppointTransliterationReviewerLoading/*, error*/}] = useAppointTransliterationReviewerMutation();
  const [executeAppointXmlConverter, {loading: executeAppointXmlConvertLoading/*, error*/}] = useAppointXmlConverterMutation();
  const [executeAppointFirstXmlReviewer, {loading: executeAppointFirstXmlReviewerLoading /*, error */}] = useAppointFirstXmlReviewerMutation();
  const [executeAppointSecondXmlReviewer, {loading: executeAppointSecondXmlReviewerLoading /*, error */}] = useAppointSecondXmlReviewerMutation();

  const onChangeAppointedTransliterationReviewer = async (reviewer: string): Promise<string> => {
    const {data} = await executeAppointTransliterationReviewer({variables: {manuscriptIdentifier, reviewer}});
    return getOrThrow(data?.executiveEditor?.appointTransliterationReviewer, 'TODO!');
  };

  const onChangeAppointedXmlConverter = async (converter: string): Promise<string> => {
    const {data} = await executeAppointXmlConverter({variables: {manuscriptIdentifier, converter}});
    return getOrThrow(data?.executiveEditor?.appointXmlConverter, 'TODO');
  };

  const onChangeAppointFirstXmlReviewer = async (reviewer: string): Promise<string> => {
    const {data} = await executeAppointFirstXmlReviewer({variables: {manuscriptIdentifier, reviewer}});
    return getOrThrow(data?.executiveEditor?.appointFirstXmlReviewer, 'TODO!');
  };

  const onChangeAppointSecondXmlReviewer = async (reviewer: string): Promise<string> => {
    const {data} = await executeAppointSecondXmlReviewer({variables: {manuscriptIdentifier, reviewer}});
    return getOrThrow(data?.executiveEditor?.appointSecondXmlReviewer, 'TODO!');
  };

  const transliterationReviewDate = transliterationReviewDateString ? formatDate(transliterationReviewDateString) : undefined;
  const xmlConversionDate = xmlConversionDateString ? formatDate(xmlConversionDateString) : undefined;
  const firstXmlReviewDate = firstXmlReviewDateString ? formatDate(firstXmlReviewDateString) : undefined;
  const secondXmlReviewDate = secondXmlReviewDateString ? formatDate(secondXmlReviewDateString) : undefined;

  return (
    <tr className="border-t border-slate-600 text-center">
      <td className="p-2">{manuscriptIdentifier}</td>

      <td className="p-2">
        {transliterationReviewDate !== undefined
          ? <span>{appointedTransliterationReviewer}</span>
          : <UserSelect currentSelected={appointedTransliterationReviewer || undefined} allUsers={allReviewers}
                        loading={executeAppointTransliterationReviewerLoading} onNewUser={onChangeAppointedTransliterationReviewer}/>}
      </td>
      <td className="p-2">
        <DateCheckMark date={transliterationReviewDate}/>
      </td>

      <td className="p-2">
        {xmlConversionDate !== undefined
          ? <span>{appointedXmlConverter}</span>
          : <UserSelect currentSelected={appointedXmlConverter || undefined} allUsers={allReviewers} loading={executeAppointXmlConvertLoading}
                        onNewUser={onChangeAppointedXmlConverter}/>}
      </td>
      <td className="p-2">
        <DateCheckMark date={xmlConversionDate}/>
      </td>

      <td className="p-2">
        {firstXmlReviewDate !== undefined
          ? <span>{appointedFirstXmlReviewer}</span>
          : <UserSelect currentSelected={appointedFirstXmlReviewer || undefined} allUsers={allReviewers} loading={executeAppointFirstXmlReviewerLoading}
                        onNewUser={onChangeAppointFirstXmlReviewer}/>}
      </td>
      <td className="p-2">
        <DateCheckMark date={firstXmlReviewDate}/>
      </td>

      <td className="p-2">
        {secondXmlReviewDate !== undefined
          ? <span>{appointedSecondXmlReviewer}</span>
          : <UserSelect currentSelected={appointedSecondXmlReviewer || undefined} allUsers={allReviewers} loading={executeAppointSecondXmlReviewerLoading}
                        onNewUser={onChangeAppointSecondXmlReviewer}/>}
      </td>
      <td className="p-2">
        <DateCheckMark date={secondXmlReviewDate}/>
      </td>
    </tr>
  );

}