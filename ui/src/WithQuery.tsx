import {MutationResult, OperationVariables, QueryResult} from '@apollo/client';
import {JSX} from 'react';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface IProps<T, U extends OperationVariables> {
  query: QueryResult<T, U> | MutationResult<T>;
  children: (t: T) => JSX.Element;
  notCalledMessage?: JSX.Element;
}

export function WithQuery<T, U extends OperationVariables>({query: {data, loading, error, called}, children, notCalledMessage}: IProps<T, U>): JSX.Element {

  const {t} = useTranslation('common');

  if (!data) {
    return (
      <div className={classNames('notification', 'has-text-centered', {'is-info': loading, 'is-warning': !!error, 'is-primary': !called})}>
        {loading && <span>{t('loading_data')}...</span>}
        {error && error.message}
        {!called && (notCalledMessage || <p>TODO!</p>)}
      </div>
    );
  } else {
    return children(data);
  }

}
