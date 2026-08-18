import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { router } from "../../../apps/api/src/routes/router";

export const getRPCClient = (): RouterClient<typeof router> => {
  // Plus aucune trace de "process", évite le crash du navigateur
  const baseUrl =
    typeof window !== "undefined" && (window as any).API_URL
      ? (window as any).API_URL
      : "http://localhost:3000";

  const rpcLink = new RPCLink({
    url: baseUrl + "/rpc",
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        credentials: "include",
      }),
  });

  return createORPCClient(rpcLink);
};
