import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const API_URL =
  import.meta.env.VITE_PLATFORM_API_URL ||
  "http://localhost:4000/platform/graphql";

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

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
