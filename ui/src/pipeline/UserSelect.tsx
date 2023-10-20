import { JSX, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps {
  currentSelected: string | null | undefined;
  allUsers: string[];
  loading: boolean;
  onNewUser: (value: string) => Promise<string>;
}

const selectClasses = 'p-2 bg-white rounded border border-slate-500 w-full disabled:opacity-50';

export function UserSelect({ currentSelected, allUsers, loading, onNewUser }: IProps): JSX.Element {

  const { t } = useTranslation('common');
  const [appointedUser, setAppointedUser] = useState(currentSelected);

  const onChange = (reviewer: string): void => {
    if (reviewer.length === 0) {
      // Empty value was chosen
      alert('Can\'t unset an appointed transliteration reviewer!');
      return;
    }

    onNewUser(reviewer)
      .then((newValue) => setAppointedUser(newValue))
      .catch((error) => console.error(error));
  };

  return (
    <select defaultValue={appointedUser || undefined} onChange={(event) => onChange(event.target.value)} className={selectClasses} disabled={loading}>
      <option value="">{t('pleaseChoose')}...</option>
      {allUsers.map((reviewer) => <option key={reviewer}>{reviewer}</option>)}
      {/* FIXME: show error */}
    </select>
  );
}