import { getRPCClient } from "./rpc";
import type { Job, PostJob, PutJob } from "@repo/models/jobs";

export class JobService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    category?: any;
    seniority_level?: any;
    industry_id?: string;
  }): Promise<Job[]> {
    return await this.rpcClient.jobs.getAll(filters || {});
  }

  public async getById(jobId: string): Promise<Job> {
    return await this.rpcClient.jobs.getById({ jobId });
  }

  public async create(input: PostJob): Promise<Job> {
    return await this.rpcClient.jobs.create(input);
  }

  public async update(jobId: string, input: PutJob): Promise<Job> {
    return await this.rpcClient.jobs.update({ jobId, ...input });
  }

  public async delete(jobId: string): Promise<void> {
    await this.rpcClient.jobs.delete({ jobId });
  }

  public async deleteBulk(jobIds: string[]): Promise<void> {
    await this.rpcClient.jobs.deleteBulk({ jobIds });
  }
}
