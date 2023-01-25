import {StrictMode} from 'react';
import './index.css';
import {RouterProvider} from 'react-router-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import {ApolloProvider} from '@apollo/client';
import {Provider as StoreProvider} from 'react-redux';
import i18n from 'i18next';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import {AllManuscriptLanguagesDocument, AllManuscriptLanguagesQuery} from './graphql';
import {createRoot} from 'react-dom/client';
import {newLanguages, newStore} from './newStore';
import common_de from './locales/common_de.json';
import common_en from './locales/common_en.json';
import {router} from './routes';
import {apolloClient} from './apolloClient';

// noinspection JSIgnoredPromiseFromCall
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    resources: {
      de: {common: common_de},
      en: {common: common_en}
    },
  });

apolloClient.query<AllManuscriptLanguagesQuery>({query: AllManuscriptLanguagesDocument})
  .then(({data}) => newStore.dispatch(newLanguages(data.manuscriptLanguages)))
  .catch(() => void 0);

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ApolloProvider client={apolloClient}>
        <StoreProvider store={newStore}>
          <RouterProvider router={router}/>
        </StoreProvider>
      </ApolloProvider>
    </I18nextProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();
