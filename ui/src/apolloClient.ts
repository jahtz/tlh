import {ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache} from '@apollo/client';
import {newStore} from './newStore';
import {apolloUri} from './urls';

const apolloAuthMiddleware = new ApolloLink((operation, forward) => {

  const state = newStore.getState();

  const headers = state.user.user?.token
    ? {Authorization: state.user.user.token || undefined}
    : {};

  operation.setContext({headers});

  return forward(operation);
});

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
