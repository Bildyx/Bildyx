import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { router } from "../../../apps/api/src/routes/router";

export const API_URL = "http://localhost:3000";

export const getRPCClient = (url?: string): RouterClient<typeof router> => {
  const rpcLink = new RPCLink({
    url: (url ?? API_URL) + "/rpc",
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        credentials: "include",
      }),
  });
  return createORPCClient(rpcLink);
};
