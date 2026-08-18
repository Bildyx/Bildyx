import { getRPCClient } from "@repo/api-client";
import type {
  Industry,
  PostIndustry,
  PutIndustry,
} from "@repo/models/industries";

export class IndustryService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: { name?: string }): Promise<Industry[]> {
    return await this.rpcClient.industries.getAll(filters || {});
  }

  public async getById(industryId: string): Promise<Industry> {
    return await this.rpcClient.industries.getById({ industryId });
  }

  public async create(input: PostIndustry): Promise<Industry> {
    return await this.rpcClient.industries.create(input);
  }

  public async update(
    industryId: string,
    input: PutIndustry,
  ): Promise<Industry> {
    return await this.rpcClient.industries.update({ industryId, ...input });
  }

  public async delete(industryId: string): Promise<void> {
    await this.rpcClient.industries.delete({ industryId });
  }

  public async deleteBulk(industryIds: string[]): Promise<void> {
    await this.rpcClient.industries.deleteBulk({ industryIds });
  }
}
