import {JSX} from 'react';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from './newStore';
import {Rights} from './graphql';
import {useTranslation} from 'react-i18next';
import {Navigate} from 'react-router-dom';
import {loginUrl} from './urls';

interface IProps {
  minRights?: Rights;
  children: (user: User) => JSX.Element;
}

const isMinRights = (rights: Rights, minRights: Rights): boolean => ({
  [Rights.Author]: true,
  [Rights.Reviewer]: rights !== Rights.Author,
  [Rights.ExecutiveEditor]: rights === Rights.ExecutiveEditor
}[minRights]);

export function RequireAuth({minRights, children}: IProps): JSX.Element {

  const currentUser = useSelector(activeUserSelector);
  const {t} = useTranslation('common');

  if (currentUser === null) {
    return <Navigate to={loginUrl}/>;
  }

  return minRights === undefined || isMinRights(currentUser.rights, minRights)
    ? children(currentUser)
    : (
      <div className="container mx-auto">
        <div className="my-4 p-2 rounded bg-red-600 text-white text-center">
          {t('insufficientRightsNeeded:{{minRights}}', {minRights})}
        </div>
      </div>
    );
}