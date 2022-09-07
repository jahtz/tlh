import {StrictMode} from 'react';
import './index.css';
import {App} from './App';
import {HashRouter} from 'react-router-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import {ApolloClient, ApolloLink, ApolloProvider, concat, HttpLink, InMemoryCache} from '@apollo/client';
import {serverUrl} from './urls';
import {Provider} from 'react-redux';
import {store} from './store/store';
import i18n from 'i18next';
import {I18nextProvider, initReactI18next} from 'react-i18next';

import common_de from './locales/de/common.json';
import common_en from './locales/en/common.json';
import {AllManuscriptLanguagesDocument, AllManuscriptLanguagesQuery} from './graphql';
import {newLanguagesAction} from './store/actions';
import {createRoot} from 'react-dom/client';

export const isDebug = process.env.NODE_ENV === 'development';

// noinspection JSIgnoredPromiseFromCall
i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: {common: common_de},
      en: {common: common_en}
    },
    lng: 'de',
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });


const apolloAuthMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: store.getState().currentUser?.jwt || null
    }
  });

  return forward(operation);
});

const versionModifier = window.location.href.includes('stable')
  ? '/stable'
  : window.location.href.includes('release')
    ? '/release'
    : '';

const apolloUri = `${serverUrl}${versionModifier}/graphql.php`;

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(
    apolloAuthMiddleware,
    new HttpLink({uri: apolloUri})
  ),
  defaultOptions: {
    query: {fetchPolicy: 'no-cache'},
    watchQuery: {fetchPolicy: 'no-cache'},
    mutate: {fetchPolicy: 'no-cache'}
  }
});

apolloClient.query<AllManuscriptLanguagesQuery>({query: AllManuscriptLanguagesDocument})
  .then(({data}) => store.dispatch(newLanguagesAction(data.manuscriptLanguages)))
  .catch(() => void 0);

const rootElement = document.getElementById('root');

if (!rootElement) {
  alert('Error in page...');
  throw new Error('Error in page...');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>
          <HashRouter>
            <App/>
          </HashRouter>
        </Provider>
      </ApolloProvider>
    </I18nextProvider>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();
