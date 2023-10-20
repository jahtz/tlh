import {
  DocumentInPipelineFragment,
  useAppointFirstXmlReviewerMutation,
  useAppointSecondXmlReviewerMutation,
  useAppointTransliterationReviewerMutation,
  useAppointXmlConverterMutation,
  useDeleteManuscriptMutation
} from '../graphql';
import { JSX } from 'react';
import { UserSelect } from './UserSelect';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '../designElements/icons';

interface IProps extends DocumentInPipelineFragment {
  allReviewers: string[];
}

const formatDate = (value: string): string => new Date(value)
  .toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (value) {
    return value;
  } else {
    throw new Error(message);
  }
}

const DateCheckMark = ({ date, user }: { date: string; user: string; }): JSX.Element => <span><code>{user}</code>, {date}</span>;

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

  const { t } = useTranslation('common');

  const [executeAppointTransliterationReviewer, { loading: executeAppointTransliterationReviewerLoading/*, error*/ }] = useAppointTransliterationReviewerMutation();
  const [executeAppointXmlConverter, { loading: executeAppointXmlConvertLoading/*, error*/ }] = useAppointXmlConverterMutation();
  const [executeAppointFirstXmlReviewer, { loading: executeAppointFirstXmlReviewerLoading /*, error */ }] = useAppointFirstXmlReviewerMutation();
  const [executeAppointSecondXmlReviewer, { loading: executeAppointSecondXmlReviewerLoading /*, error */ }] = useAppointSecondXmlReviewerMutation();
  const [deleteManuscript, { loading: deleteManuscriptLoading/*, error */ }] = useDeleteManuscriptMutation();

  const onChangeAppointedTransliterationReviewer = async (reviewer: string): Promise<string> => {
    const { data } = await executeAppointTransliterationReviewer({ variables: { manuscriptIdentifier, reviewer } });
    return getOrThrow(data?.executiveEditor?.appointTransliterationReviewer, 'TODO!');
  };

  const onChangeAppointedXmlConverter = async (converter: string): Promise<string> => {
    const { data } = await executeAppointXmlConverter({ variables: { manuscriptIdentifier, converter } });
    return getOrThrow(data?.executiveEditor?.appointXmlConverter, 'TODO');
  };

  const onChangeAppointFirstXmlReviewer = async (reviewer: string): Promise<string> => {
    const { data } = await executeAppointFirstXmlReviewer({ variables: { manuscriptIdentifier, reviewer } });
    return getOrThrow(data?.executiveEditor?.appointFirstXmlReviewer, 'TODO!');
  };

  const onChangeAppointSecondXmlReviewer = async (reviewer: string): Promise<string> => {
    const { data } = await executeAppointSecondXmlReviewer({ variables: { manuscriptIdentifier, reviewer } });
    return getOrThrow(data?.executiveEditor?.appointSecondXmlReviewer, 'TODO!');
  };

  const onDeleteManuscript = async (): Promise<void> => {
    // FIXME: confirm!
    if (!confirm(t('reallyDeleteManuscript'))) {
      return;
    }

    const { data } = await deleteManuscript({ variables: { manuscriptIdentifier } });

    if (data?.executiveEditor?.deleteManuscript) {
      window.location.reload();
    } else {
      console.info('Manuscript was not deleted...');
    }
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
          ? <DateCheckMark date={transliterationReviewDate} user={appointedTransliterationReviewer || 'ERROR!'} />
          : <UserSelect currentSelected={appointedTransliterationReviewer} allUsers={allReviewers} loading={executeAppointTransliterationReviewerLoading}
            onNewUser={onChangeAppointedTransliterationReviewer} />}
      </td>

      <td className="p-2">
        {xmlConversionDate !== undefined
          ? <DateCheckMark date={xmlConversionDate} user={appointedXmlConverter || 'ERROR!'} />
          : <UserSelect currentSelected={appointedXmlConverter} allUsers={allReviewers} loading={executeAppointXmlConvertLoading}
            onNewUser={onChangeAppointedXmlConverter} />}
      </td>

      <td className="p-2">
        {firstXmlReviewDate !== undefined
          ? <DateCheckMark date={firstXmlReviewDate} user={appointedFirstXmlReviewer || 'ERROR!'} />
          : <UserSelect currentSelected={appointedFirstXmlReviewer} allUsers={allReviewers} loading={executeAppointFirstXmlReviewerLoading}
            onNewUser={onChangeAppointFirstXmlReviewer} />}
      </td>

      <td className="p-2">
        {secondXmlReviewDate !== undefined
          ? <DateCheckMark date={secondXmlReviewDate} user={appointedSecondXmlReviewer || 'ERROR!'} />
          : <UserSelect currentSelected={appointedSecondXmlReviewer} allUsers={allReviewers} loading={executeAppointSecondXmlReviewerLoading}
            onNewUser={onChangeAppointSecondXmlReviewer} />}
      </td>

      <td className="p-2">
        <button type="button" onClick={onDeleteManuscript} title={t('deleteManuscript')} disabled={deleteManuscriptLoading}
          className="px-4 py-2 rounded bg-red-600 text-white">
          <DeleteIcon />
        </button>
      </td>
    </tr>
  );

}