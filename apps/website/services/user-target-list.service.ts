import { getRPCClient } from "@repo/api-client";
import type { UserTargetList, PostUserTargetList } from "@repo/models/user_target_lists";

export class UserTargetListService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: {
    user_profile_id?: string;
    organization_id?: string;
  }): Promise<UserTargetList[]> {
    return await this.rpcClient.user_target_lists.getAll(filters || {});
  }

  public async getById(userTargetListId: string): Promise<UserTargetList> {
    return await this.rpcClient.user_target_lists.getById({ userTargetListId });
  }

  public async create(input: PostUserTargetList): Promise<UserTargetList> {
    return await this.rpcClient.user_target_lists.create(input);
  }

  public async delete(userTargetListId: string): Promise<void> {
    await this.rpcClient.user_target_lists.delete({ userTargetListId });
  }

  public async deleteBulk(userTargetListIds: string[]): Promise<void> {
    await this.rpcClient.user_target_lists.deleteBulk({ userTargetListIds });
  }
}
