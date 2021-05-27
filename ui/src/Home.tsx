import React from 'react';
import {useTranslation} from "react-i18next";
import {IndexQuery, useIndexQuery} from './generated/graphql';
import {Link} from 'react-router-dom';
import {WithQuery} from "./WithQuery";
import {createManuscriptUrl} from "./urls";

export function Home(): JSX.Element {

  const {t} = useTranslation('common');
  const indexQuery = useIndexQuery();

  function render({allManuscripts}: IndexQuery): JSX.Element {
    if (allManuscripts.length === 0) {
      return <div className="notification is-primary has-text-centered">{t('noManuscriptsYet')}</div>;
    }

    return (
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th>{t('mainIdentifier')}</th>
            <th>{t('status')}</th>
            <th>{t('creator')}</th>
          </tr>
        </thead>
        <tbody>
          {allManuscripts.map(({mainIdentifier: {identifier, identifierType}, status, creatorUsername}) =>
            <tr key={identifier}>
              <td>
                <Link to={`manuscripts/${encodeURIComponent(identifier)}/data`}>
                  {identifier} ({identifierType})
                </Link>
              </td>
              <td>{status}</td>
              <td>{creatorUsername}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <div className="container">
      <h1 className="title is-3 has-text-centered">{t('manuskript_plural')}</h1>

      <WithQuery query={indexQuery} children={render}/>

      <Link className="button is-link is-fullwidth" to={createManuscriptUrl}>
        {t('createManuscript')}
      </Link>
    </div>
  );
}
