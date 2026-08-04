import { getRPCClient } from "@repo/api-client";
import type {
  UserEducationField,
  PostUserEducationField,
  PutUserEducationField,
} from "@repo/models/user_education_fields";

export class UserEducationFieldService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByEducation(userEducationId: string): Promise<UserEducationField[]> {
    return await this.rpcClient.user_education_fields.getByEducation({ userEducationId });
  }

  public async getById(fieldId: string): Promise<UserEducationField> {
    return await this.rpcClient.user_education_fields.getById({ fieldId });
  }

  public async create(input: PostUserEducationField): Promise<UserEducationField> {
    return await this.rpcClient.user_education_fields.create(input);
  }

  public async update(fieldId: string, input: PutUserEducationField): Promise<UserEducationField> {
    return await this.rpcClient.user_education_fields.update({ fieldId, ...input });
  }

  public async delete(fieldId: string): Promise<UserEducationField> {
    return await this.rpcClient.user_education_fields.delete({ fieldId });
  }

  public async deleteBulk(fieldIds: string[]): Promise<void> {
    await this.rpcClient.user_education_fields.deleteBulk({ fieldIds });
  }
}
