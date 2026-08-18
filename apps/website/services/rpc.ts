import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { router } from "../../../apps/api/src/routes/router";

export const getRPCClient = (): RouterClient<typeof router> => {
  const rpcLink = new RPCLink({
    url: `${process.env.API_URL}/rpc`,
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        credentials: "include",
      }),
  });

  return createORPCClient(rpcLink);
};
