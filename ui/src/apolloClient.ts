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

const versionModifier = (process.env.REACT_APP_VERSION as string).length > 0
  ? `/${process.env.REACT_APP_VERSION}`
  : '';

const apolloUri = `${process.env.REACT_APP_SERVER_URL}${versionModifier}/graphql.php`;

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
