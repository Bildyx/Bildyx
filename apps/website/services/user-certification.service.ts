import { getRPCClient } from "@repo/api-client";
import type {
  UserCertification,
  PostUserCertification,
  PutUserCertification,
} from "@repo/models/user_certifications";

export class UserCertificationService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByProfile(
    userProfileId: string,
  ): Promise<UserCertification[]> {
    return await this.rpcClient.user_certifications.getCertificationByProfile({
      userProfileId,
    });
  }

  public async getById(
    userCertificationId: string,
  ): Promise<UserCertification> {
    return await this.rpcClient.user_certifications.getById({
      userCertificationId,
    });
  }

  public async create(
    input: PostUserCertification,
  ): Promise<UserCertification> {
    return await this.rpcClient.user_certifications.create(input);
  }

  public async update(
    userCertificationId: string,
    input: PutUserCertification,
  ): Promise<UserCertification> {
    return await this.rpcClient.user_certifications.update({
      userCertificationId,
      ...input,
    });
  }

  public async delete(userCertificationId: string): Promise<UserCertification> {
    return await this.rpcClient.user_certifications.delete({
      userCertificationId,
    });
  }

  public async deleteBulk(userCertificationIds: string[]): Promise<void> {
    await this.rpcClient.user_certifications.deleteBulk({
      userCertificationIds,
    });
  }
}
