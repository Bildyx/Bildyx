import { getRPCClient } from "./rpc";
import type { Degree, PostDegree, PutDegree } from "@repo/models/degrees";

export class DegreeService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    level?: "HIGH_SCHOOL" | "ASSOCIATE" | "BACHELOR" | "MASTER" | "PHD";
  }): Promise<Degree[]> {
    return await this.rpcClient.degrees.getAll(filters || {});
  }

  public async getById(degreeId: string): Promise<Degree> {
    return await this.rpcClient.degrees.getById({ degreeId });
  }

  public async create(input: PostDegree): Promise<Degree> {
    return await this.rpcClient.degrees.create(input);
  }

  public async update(degreeId: string, input: PutDegree): Promise<Degree> {
    return await this.rpcClient.degrees.update({ degreeId, ...input });
  }

  public async delete(degreeId: string): Promise<void> {
    await this.rpcClient.degrees.delete({ degreeId });
  }

  public async deleteBulk(degreeIds: string[]): Promise<void> {
    await this.rpcClient.degrees.deleteBulk({ degreeIds });
  }
}
