import {useAppointReviewerForReleasedTransliterationMutation} from '../graphql';
import {JSX, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface IProps {
  mainIdentifier: string;
  currentAppointedUser: string | undefined;
  allReviewers: string[];
}

export function TransliterationReviewerSelect({mainIdentifier, currentAppointedUser, allReviewers}: IProps): JSX.Element {

  const {t} = useTranslation('common');

  const [appointedUser, setAppointedUser] = useState(currentAppointedUser);
  const [executeAppointReviewer, {loading/*, error*/}] = useAppointReviewerForReleasedTransliterationMutation();

  const onChange = (reviewer: string): void => {
    if (reviewer.length === 0) {
      // Empty value was chosen
      alert('Can\'t unset an appointed transliteration reviewer!');
      return;
    }

    executeAppointReviewer({variables: {mainIdentifier, reviewer}})
      .then(({data}) => {
        if (data?.executiveEditor?.appointReviewerForReleasedTransliteration) {
          setAppointedUser(data.executiveEditor.appointReviewerForReleasedTransliteration);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <select defaultValue={appointedUser} onChange={(event) => onChange(event.target.value)}
            className="p-2 bg-white rounded border border-slate-500 w-full disabled:opacity-50" disabled={loading}>
      <option value="">{t('pleaseChoose')}...</option>
      {allReviewers.map((reviewer) => <option key={reviewer}>{reviewer}</option>)}
      {/* FIXME: show error */}
    </select>

  );
}