import { getRPCClient } from "@repo/api-client";
import type {
  UserExperience,
  PostUserExperience,
  PutUserExperience,
} from "@repo/models/user_experiences";

export class UserExperienceService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByProfile(userProfileId: string): Promise<UserExperience[]> {
    return await this.rpcClient.user_experiences.getExperiencesByProfile({
      userProfileId,
    });
  }

  public async getById(userExperienceId: string): Promise<UserExperience> {
    return await this.rpcClient.user_experiences.getById({ userExperienceId });
  }

  public async create(input: PostUserExperience): Promise<UserExperience> {
    return await this.rpcClient.user_experiences.create(input);
  }

  public async update(
    userExperienceId: string,
    input: PutUserExperience,
  ): Promise<UserExperience> {
    return await this.rpcClient.user_experiences.update({
      userExperienceId,
      ...input,
    });
  }

  public async delete(userExperienceId: string): Promise<UserExperience> {
    return await this.rpcClient.user_experiences.delete({ userExperienceId });
  }

  public async deleteBulk(userExperienceIds: string[]): Promise<void> {
    await this.rpcClient.user_experiences.deleteBulk({ userExperienceIds });
  }
}
