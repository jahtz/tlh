import React from "react";
import {QueryResult} from "@apollo/client/react/types/types";
import {useTranslation} from "react-i18next";
import classNames from "classnames";

interface IProps<T> {
    query: QueryResult<T>;
    children: (t: T) => JSX.Element;
}

export function WithQuery<T>({query: {data, loading, error}, children}: IProps<T>): JSX.Element {

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
        return children(data);
    }
}