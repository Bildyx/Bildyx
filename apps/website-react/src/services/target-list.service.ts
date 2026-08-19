import { getRPCClient } from "./rpc";
import type { TargetRow, MatchCategory } from "../components/target-list/types";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";

export type GetTargetsParams = {
  userProfileId: string;
  city?: string;
  country?: string;
  sizes?: EmployeeCountRange[];
  subtypes?: OrganizationSubType[];
  matchFilter?: MatchCategory;
  keyword?: string;
};

export class TargetListService {
  private readonly rpcClient = getRPCClient();

  public async getTargets(params: GetTargetsParams): Promise<TargetRow[]> {
    return (await this.rpcClient.target_list.getTargets(params)) as TargetRow[];
  }
}
