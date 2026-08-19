import { getRPCClient } from "./rpc";
import type { JobAdSkill, PostJobAdSkill } from "@repo/models/job_ads_skills";

export class JobAdSkillService {
  private readonly rpcClient = getRPCClient();

  public async getByJobAd(jobAdId: string): Promise<JobAdSkill[]> {
    return await this.rpcClient.job_ads_skills.getByJobAd({ jobAdId });
  }

  public async create(input: PostJobAdSkill): Promise<JobAdSkill> {
    return await this.rpcClient.job_ads_skills.create(input);
  }

  public async delete(jobAdSkillId: string): Promise<void> {
    await this.rpcClient.job_ads_skills.delete({ jobAdSkillId });
  }
}
