import {Navigate} from 'react-router-dom';
import {JSX} from 'react';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from './newStore';
import {loginUrl} from './urls';
import {Rights} from './graphql';

interface IProps {
  to?: string,
  minRights?: Rights;
  children: (user: User) => JSX.Element
}

const isMinRights = (rights: Rights, minRights: Rights): boolean => ({
  [Rights.Author]: true,
  [Rights.Reviewer]: rights !== Rights.Author,
  [Rights.ExecutiveEditor]: rights === Rights.ExecutiveEditor
}[minRights]);

export function RequireAuth({to = loginUrl, minRights, children}: IProps): JSX.Element {

  const currentUser = useSelector(activeUserSelector);

  return currentUser !== null && (minRights === undefined || isMinRights(currentUser.rights, minRights))
    ? children(currentUser)
    : <Navigate to={to}/>;
}