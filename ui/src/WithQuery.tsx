import {OperationVariables, QueryResult} from '@apollo/client';
import {JSX} from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface IProps<T, U extends OperationVariables = OperationVariables> {
  query: QueryResult<T, U>;
  children: (t: T, refresh: () => void) => JSX.Element;
  notCalledMessage?: JSX.Element;
}

export function WithQuery<T, U extends OperationVariables = OperationVariables>({
  query: {data, loading, error, called, refetch},
  children,
  notCalledMessage
}: IProps<T, U>): JSX.Element {

  const {t} = useTranslation('common');

  return data
    ? children(data, refetch)
    : (
      <div className={classNames('notification', 'has-text-centered', {'is-info': loading, 'is-warning': !!error, 'is-primary': !called})}>
        {loading && <span>{t('loading_data')}...</span>}
        {error && error.message}
        {!called && (notCalledMessage || <p>TODO!</p>)}
      </div>
    );
}
