import { getRPCClient } from "@repo/api-client";
import type {
  UserLanguage,
  PostUserLanguage,
  PutUserLanguage,
} from "@repo/models/user_languages";

export class UserLanguageService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByProfile(userProfileId: string): Promise<UserLanguage[]> {
    return await this.rpcClient.user_languages.getLanguagesByProfile({
      userProfileId,
    });
  }

  public async getById(userLanguageId: string): Promise<UserLanguage> {
    return await this.rpcClient.user_languages.getById({ userLanguageId });
  }

  public async create(input: PostUserLanguage): Promise<UserLanguage> {
    return await this.rpcClient.user_languages.create(input);
  }

  public async update(
    userLanguageId: string,
    input: PutUserLanguage,
  ): Promise<UserLanguage> {
    return await this.rpcClient.user_languages.update({
      userLanguageId,
      ...input,
    });
  }

  public async delete(userLanguageId: string): Promise<UserLanguage> {
    return await this.rpcClient.user_languages.delete({ userLanguageId });
  }

  public async deleteBulk(userLanguageIds: string[]): Promise<void> {
    await this.rpcClient.user_languages.deleteBulk({ userLanguageIds });
  }
}
