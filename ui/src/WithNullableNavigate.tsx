import {Navigate} from 'react-router-dom';
import {homeUrl} from './urls';

interface IProps<T> {
  t: T | undefined | null;
  children: (t: T) => JSX.Element;
  to?: string;
}

export function WithNullableNavigate<T>({t, children, to}: IProps<T>): JSX.Element {
  return t
    ? children(t)
    : <Navigate to={to || homeUrl}/>;
}