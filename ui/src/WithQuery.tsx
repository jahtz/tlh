import {MutationResult, QueryResult} from '@apollo/client';
import classNames from 'classnames';
import {useTranslation} from 'react-i18next';

interface IProps<T> {
  query: QueryResult<T> | MutationResult<T>;
  render: (t: T) => JSX.Element;
  notCalledMessage?: JSX.Element;
}

// FIXME: rename render as children!
export function WithQuery<T>({query: {data, loading, error, called}, render, notCalledMessage}: IProps<T>): JSX.Element {

  const {t} = useTranslation('common');

  if (!data) {
    return <div className={classNames('notification', 'has-text-centered', {'is-info': loading, 'is-warning': !!error, 'is-primary': !called})}>
      {loading && <span>{t('loading_data')}...</span>}
      {error && error.message}
      {!called && (notCalledMessage || <p>{t('mutationNotYetCalled')}</p>)}
    </div>;
  } else {
    return render(data);
  }

}