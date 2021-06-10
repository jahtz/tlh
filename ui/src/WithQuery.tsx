import React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import {ApolloError} from '@apollo/client';

interface QueryData<T> {
  data: T | undefined;
  loading: boolean;
  error?: ApolloError;
}

interface IProps<T> {
  query: QueryData<T>;
  render: (t: T) => JSX.Element;
}

export function WithQuery<T>({query: {data, loading, error}, render}: IProps<T>): JSX.Element {

  const {t} = useTranslation('common');

  if (!data) {
    const classes = classNames('notification', 'has-text-centered', {'is-info': loading, 'is-warning': !!error});

    return (
      <div className={classes}>
        {loading && <span>{t('loadingData')}...</span>}
        {error && error.message}
      </div>
    );
  } else {
    return render(data);
  }
}