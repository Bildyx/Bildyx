import { getRPCClient } from "./rpc";
import type { JobAd, PostJobAd, PutJobAd } from "@repo/models/job_ads";

export class JobAdService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    organization_id?: string;
    job_id?: string;
    contract_type?:
      | "OTHER"
      | "APPRENTICESHIP"
      | "FREELANCE"
      | "FULL_TIME"
      | "INTERNSHIP"
      | "PART_TIME";
    remote?: "FULL_REMOTE" | "HYBRID" | "ON_SITE";
    status?: "CLOSED" | "DRAFT" | "FILLED" | "PUBLISHED";
    country_id?: string;
    city_id?: string;
  }): Promise<JobAd[]> {
    return await this.rpcClient.job_ads.getAll(filters || {});
  }

  public async getById(jobAdId: string): Promise<JobAd> {
    return await this.rpcClient.job_ads.getById({ jobAdId });
  }

  public async create(input: PostJobAd): Promise<JobAd> {
    return await this.rpcClient.job_ads.create(input);
  }

  public async update(jobAdId: string, input: PutJobAd): Promise<JobAd> {
    return await this.rpcClient.job_ads.update({ jobAdId, ...input });
  }

  public async delete(jobAdId: string): Promise<void> {
    await this.rpcClient.job_ads.delete({ jobAdId });
  }

  public async deleteBulk(jobAdIds: string[]): Promise<void> {
    await this.rpcClient.job_ads.deleteBulk({ jobAdIds });
  }
}
