'use client';

import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/query', // change if backend is remote
});

const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: 'ws://localhost:8080/query',
  on: {
    connected: () => console.log('✅ WebSocket connected'),
    closed: () => console.warn('❌ WebSocket closed'),
    error: (err) => console.error('💥 WebSocket error:', err),
  }
})) : null;


const splitLink = typeof window !== 'undefined' && wsLink ? split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpLink
) : httpLink;

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
