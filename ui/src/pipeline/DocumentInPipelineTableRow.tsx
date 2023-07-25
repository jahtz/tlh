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

function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (value) {
    return value;
  } else {
    throw new Error(message);
  }
}

const DateCheckMark = ({date, user}: { date: string; user: string; }): JSX.Element => <span><code>{user}</code>, {date}</span>;

export function DocumentInPipelineTableRow({
  allReviewers,
  manuscriptIdentifier,
  author,
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

      <td className="p-2">{author}</td>

      <td className="p-2">
        {transliterationReviewDate !== undefined
          ? <DateCheckMark date={transliterationReviewDate} user={appointedTransliterationReviewer || 'ERROR!'}/>
          : <UserSelect currentSelected={appointedTransliterationReviewer || undefined} allUsers={allReviewers}
                        loading={executeAppointTransliterationReviewerLoading} onNewUser={onChangeAppointedTransliterationReviewer}/>}
      </td>

      <td className="p-2">
        {xmlConversionDate !== undefined
          ? <DateCheckMark date={xmlConversionDate} user={appointedXmlConverter || 'ERROR!'}/>
          : <UserSelect currentSelected={appointedXmlConverter || undefined} allUsers={allReviewers} loading={executeAppointXmlConvertLoading}
                        onNewUser={onChangeAppointedXmlConverter}/>}
      </td>

      <td className="p-2">
        {firstXmlReviewDate !== undefined
          ? <DateCheckMark date={firstXmlReviewDate} user={appointedFirstXmlReviewer || 'ERROR!'}/>
          : <UserSelect currentSelected={appointedFirstXmlReviewer || undefined} allUsers={allReviewers} loading={executeAppointFirstXmlReviewerLoading}
                        onNewUser={onChangeAppointFirstXmlReviewer}/>}
      </td>

      <td className="p-2">
        {secondXmlReviewDate !== undefined
          ? <DateCheckMark date={secondXmlReviewDate} user={appointedSecondXmlReviewer || 'ERROR!'}/>
          : <UserSelect currentSelected={appointedSecondXmlReviewer || undefined} allUsers={allReviewers} loading={executeAppointSecondXmlReviewerLoading}
                        onNewUser={onChangeAppointSecondXmlReviewer}/>}
      </td>
    </tr>
  );

}