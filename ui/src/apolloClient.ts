import {serverUrl} from './urls';
import {ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache} from '@apollo/client';
import {newStore} from './newStore';


const apolloAuthMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      Authorization: newStore.getState().user?.user?.token || null
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


export const apolloClient = new ApolloClient({
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
