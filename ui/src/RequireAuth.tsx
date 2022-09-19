import {Navigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {activeUserSelector, User} from './newStore';
import {loginUrl} from './urls';

interface IProps {
  to?: string,
  children: (user: User) => JSX.Element
}

export function RequireAuth({to = loginUrl, children}: IProps): JSX.Element {

  const currentUser = useSelector(activeUserSelector);

  return currentUser
    ? children(currentUser)
    : <Navigate to={to}/>;
}