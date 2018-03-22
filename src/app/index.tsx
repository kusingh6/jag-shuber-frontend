import * as React from 'react';
import { render } from 'react-dom';
import { unregister } from './registerServiceWorker';
import store from './store'
import { Provider } from 'react-redux';
import RootLayout from './RootLayout';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';

const httpLink = createHttpLink({
  uri: 'http://localhost:5000/graphql',
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
});

render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <RootLayout />
    </Provider>
  </ApolloProvider>
  ,
  document.getElementById('root') as HTMLElement
);

// The Service work appears to be aggressively caching the application
// So i'm unregistering for now until we understand more about it
// see https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#opting-out-of-caching
// registerServiceWorker();
unregister();
