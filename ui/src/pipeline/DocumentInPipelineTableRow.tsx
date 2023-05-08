import {TransliterationReviewerSelect} from './TransliterationReviewerSelect';
import {DocumentInPipelineFragment} from '../graphql';
import {JSX} from 'react';

interface IProps extends DocumentInPipelineFragment {
  allReviewers: string[];
}

export function DocumentInPipelineTableRow({
  allReviewers,
  manuscriptIdentifier,
  transliterationReviewDateString,
  appointedTransliterationReviewer,
  appointedXmlConverter
}: IProps): JSX.Element {

  const transliterationReviewPerformed = !!transliterationReviewDateString;

  const transliterationReviewDate = transliterationReviewDateString
    ? new Date(transliterationReviewDateString).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
    : undefined;

  return (
    <tr className="border-t border-slate-600 text-center">
      <td className="p-2">{manuscriptIdentifier}</td>
      <td className="p-2">
        {transliterationReviewPerformed
          ? <span>{appointedTransliterationReviewer}</span>
          : <TransliterationReviewerSelect mainIdentifier={manuscriptIdentifier} currentAppointedUser={appointedTransliterationReviewer || undefined}
                                           allReviewers={allReviewers}/>}
      </td>
      <td className="p-2">{transliterationReviewDate ? <span>&#x2714; ({transliterationReviewDate})</span> : <span>&#x2718;</span>}</td>
      <td className="p-2">{appointedXmlConverter}</td>
    </tr>
  );

}