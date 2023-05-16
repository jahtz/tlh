import {DocumentInPipelineFragment, useAppointTransliterationReviewerMutation, useAppointXmlConverterMutation} from '../graphql';
import {JSX} from 'react';
import {UserSelect} from './UserSelect';

interface IProps extends DocumentInPipelineFragment {
  allReviewers: string[];
}

const formatDate = (value: string): string => new Date(value)
  .toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});

export function DocumentInPipelineTableRow({
  allReviewers,
  manuscriptIdentifier,
  transliterationReviewDateString,
  appointedTransliterationReviewer,
  appointedXmlConverter
}: IProps): JSX.Element {

  const [executeAppointTransliterationReviewer, {loading: executeAppointTransliterationReviewerLoading/*, error*/}] = useAppointTransliterationReviewerMutation();
  const [executeAppointXmlConverter, {loading: executeAppointXmlConvertLoading/*, error*/}] = useAppointXmlConverterMutation();

  const onChangeAppointedTransliterationReviewer = async (reviewer: string): Promise<string> => {
    const {data} = await executeAppointTransliterationReviewer({variables: {manuscriptIdentifier, reviewer}});

    if (data?.executiveEditor?.appointReviewerForReleasedTransliteration) {
      return data.executiveEditor.appointReviewerForReleasedTransliteration;
    } else {
      throw new Error('TODO!');
    }
  };

  const onChangeAppointedXmlConverter = async (converter: string): Promise<string> => {
    const {data} = await executeAppointXmlConverter({variables: {manuscriptIdentifier, converter}});

    if (data?.executiveEditor?.appointXmlConverter) {
      return data.executiveEditor.appointXmlConverter;
    } else {
      throw new Error('TODO');
    }
  };

  const transliterationReviewDate = transliterationReviewDateString
    ? formatDate(transliterationReviewDateString)
    : undefined;

  return (
    <tr className="border-t border-slate-600 text-center">
      <td className="p-2">{manuscriptIdentifier}</td>
      <td className="p-2">
        {transliterationReviewDate !== undefined
          ? <span>{appointedTransliterationReviewer}</span>
          : <UserSelect currentSelected={appointedTransliterationReviewer || undefined} allUsers={allReviewers}
                        loading={executeAppointTransliterationReviewerLoading}
                        onNewUser={onChangeAppointedTransliterationReviewer}/>}
      </td>
      <td className="p-2">{transliterationReviewDate ? <span>&#x2714; ({transliterationReviewDate})</span> : <span>&#x2718;</span>}</td>
      <td className="p-2">
        <UserSelect currentSelected={appointedXmlConverter || undefined} allUsers={allReviewers} loading={executeAppointXmlConvertLoading}
                    onNewUser={onChangeAppointedXmlConverter}/>
      </td>
    </tr>
  );

}