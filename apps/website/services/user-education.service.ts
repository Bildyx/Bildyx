import { getRPCClient } from "@repo/api-client";
import type {
  UserEducation,
  PostUserEducation,
  PutUserEducation,
} from "@repo/models/user_educations";

export class UserEducationService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByProfile(userProfileId: string): Promise<UserEducation[]> {
    return await this.rpcClient.user_educations.getEducationsByProfile({
      userProfileId,
    });
  }

  public async getById(educationId: string): Promise<UserEducation> {
    return await this.rpcClient.user_educations.getById({ educationId });
  }

  public async create(input: PostUserEducation): Promise<UserEducation> {
    return await this.rpcClient.user_educations.create(input);
  }

  public async update(
    educationId: string,
    input: PutUserEducation,
  ): Promise<UserEducation> {
    return await this.rpcClient.user_educations.update({
      educationId,
      ...input,
    });
  }

  public async delete(educationId: string): Promise<UserEducation> {
    return await this.rpcClient.user_educations.delete({ educationId });
  }

  public async deleteBulk(educationIds: string[]): Promise<void> {
    await this.rpcClient.user_educations.deleteBulk({ educationIds });
  }
}
