import { getRPCClient } from "./rpc";
import type {
  UserProfile,
  PostUserProfile,
  PutUserProfile,
} from "@repo/models/user_profiles";

export class UserProfileService {
  private readonly rpcClient = getRPCClient();

  public async getFullProfileByUserId(userId: string) {
    return await this.rpcClient.user_profiles.getFullProfileByUser({
      userId,
    });
  }

  public async getById(profileId: string): Promise<UserProfile> {
    return await this.rpcClient.user_profiles.getById({ profileId });
  }

  public async getAll(
    input: {
      userId?: string;
      countryId?: string;
      cityId?: string;
      excludeOrganizations?: boolean;
    } = {},
  ): Promise<UserProfile[]> {
    return await this.rpcClient.user_profiles.getAll(input);
  }

  public async create(input: PostUserProfile): Promise<UserProfile> {
    return await this.rpcClient.user_profiles.create(input);
  }

  public async update(
    profileId: string,
    input: PutUserProfile,
  ): Promise<UserProfile> {
    return await this.rpcClient.user_profiles.update({ profileId, ...input });
  }
}
