import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import update from 'immutability-helper';
import {useAppointReviewerForReleasedTransliterationMutation} from './graphql';

interface IProps {
  manuscripts: string[];
  reviewers: string[];
}

interface Appointment {
  mainIdentifier: string;
  reviewer?: string;
}

const dataListId = 'reviewers';

export function ReviewerAppointing({manuscripts: initialManuscripts, reviewers}: IProps): JSX.Element {

  const {t} = useTranslation('common');
  const [state, setState] = useState<Appointment[]>(initialManuscripts.map((mainIdentifier) => ({mainIdentifier})));
  const [appointUser] = useAppointReviewerForReleasedTransliterationMutation();


  // TODO: make PaginatedTable?

  const setReviewer = (index: number, reviewer: string): void => setState((state) => update(state, {[index]: {reviewer: {$set: reviewer}}}));

  const submitAppointment = (index: number): void => {
    const {mainIdentifier, reviewer} = state[index];

    if (reviewer === undefined) {
      alert('No reviewer set!');
      return;
    }

    appointUser({variables: {mainIdentifier, reviewer}})
      .then(({data}) => {
        if (data?.executiveEditor?.appointReviewerForReleasedTransliteration) {
          setState((state) => update(state, {$splice: [[index, 1]]}));
        }
      })
      .catch((error) => console.error(error));

    console.info(`TODO: appoint reviewer ${reviewer} for manuscript ${mainIdentifier}`);
  };

  if (state.length === 0) {
    return <div className="p-2 text-cyan-500 italic text-center">{t('noAppointmentsToMake')}.</div>;
  }

  return (
    <>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="text-center border-b-2 border-slate-500">
            <th>{t('manuscriptId')}</th>
            <th>{t('reviewer')}</th>
            <th>{t('submitAppointment')}</th>
          </tr>
        </thead>
        <tbody>
          {state.map(({mainIdentifier, reviewer}, index) => <tr key={mainIdentifier} className="border-t border-slate-600 text-center">
            <td className="p-2">{mainIdentifier}</td>
            <td className="p-2">
              <input type="text" list={dataListId} defaultValue={reviewer} onChange={(event) => setReviewer(index, event.target.value)}
                     className="p-2 rounded border border-slate-500 w-full"/>
            </td>
            <td>
              <button type="button" onClick={() => submitAppointment(index)} className="p-2 rounded bg-blue-600 text-white w-full disabled:opacity-50"
                      title={reviewer !== undefined ? t('noReviewerSet!') || 'noReviewerSet' : undefined} disabled={reviewer === undefined}>
                &#x21AA;
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>

      <datalist id={dataListId}>
        {reviewers.map((reviewer) => <option key={reviewer}>{reviewer}</option>)}
      </datalist>
    </>
  );
}