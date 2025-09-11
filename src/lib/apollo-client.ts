import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Somnia subgraph endpoints
const SOMNIA_SUBGRAPH_URL = 'https://proxy.somnia.chain.love/subgraphs/name/somnia-testnet/SomFlip';
const NFTFLOW_SUBGRAPH_URL = 'https://proxy.somnia.chain.love/subgraphs/name/nftflow/rentals';

// Create HTTP link
const httpLink = createHttpLink({
  uri: SOMNIA_SUBGRAPH_URL,
});

// Add authentication headers if needed
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  }
});

// Create Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          flipResults: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          rentals: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;

// Create a separate client for NFTFlow subgraph
export const nftFlowClient = new ApolloClient({
  link: createHttpLink({
    uri: NFTFLOW_SUBGRAPH_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

