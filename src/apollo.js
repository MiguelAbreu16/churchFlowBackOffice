import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const API_URL =
  import.meta.env.VITE_PLATFORM_API_URL ||
  "http://localhost:4000/platform/graphql";

const WS_URL = API_URL.replace(/^http/, "ws");

const httpLink = createHttpLink({ uri: API_URL });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("platform_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors?.some((e) => e.message === "Unauthorized")) {
    localStorage.removeItem("platform_token");
    localStorage.removeItem("platform_user");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
  if (networkError) {
    console.error("[Platform API]", networkError);
  }
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    connectionParams: () => {
      const token = localStorage.getItem("platform_token");
      return { authorization: token ? `Bearer ${token}` : "" };
    },
    shouldRetry: () => true,
    retryAttempts: 5,
  }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink]),
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
