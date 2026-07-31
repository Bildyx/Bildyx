import { getRPCClient } from "@repo/api-client";
import type {
  UserSkill,
  PostUserSkill,
  PutUserSkill,
} from "@repo/models/user_skills";

export class UserSkillService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByProfile(userProfileId: string): Promise<UserSkill[]> {
    return await this.rpcClient.user_skills.getSkillsByProfile({
      userProfileId,
    });
  }

  public async getById(userSkillId: string): Promise<UserSkill> {
    return await this.rpcClient.user_skills.getById({ userSkillId });
  }

  public async create(input: PostUserSkill): Promise<UserSkill> {
    return await this.rpcClient.user_skills.create(input);
  }

  public async update(
    userSkillId: string,
    input: PutUserSkill,
  ): Promise<UserSkill> {
    return await this.rpcClient.user_skills.update({ userSkillId, ...input });
  }

  public async delete(userSkillId: string): Promise<UserSkill> {
    return await this.rpcClient.user_skills.delete({ userSkillId });
  }

  public async deleteBulk(userSkillIds: string[]): Promise<void> {
    await this.rpcClient.user_skills.deleteBulk({ userSkillIds });
  }
}
