import { GetTargetList, TargetRow } from "@repo/models/target_list";
import { getRPCClient } from "./rpc";

export type GetTargetsParams = GetTargetList;

export class TargetListService {
  private readonly rpcClient = getRPCClient();

  public async getTargets(params: GetTargetsParams): Promise<TargetRow[]> {
    return (await this.rpcClient.target_list.getTargets(params)) as TargetRow[];
  }
}
