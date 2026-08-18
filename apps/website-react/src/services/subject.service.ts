import { getRPCClient } from "@repo/api-client";
import type {
  Subject,
  PostSubject,
  PutSubject,
} from "@repo/models/subjects";

export class SubjectService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: {
    name?: string;
    category?: any;
    organization_id?: string;
  }): Promise<Subject[]> {
    return await this.rpcClient.subjects.getAll(filters || {});
  }

  public async getById(subjectId: string): Promise<Subject> {
    return await this.rpcClient.subjects.getById({ subjectId });
  }

  public async create(input: PostSubject): Promise<Subject> {
    return await this.rpcClient.subjects.create(input);
  }

  public async update(subjectId: string, input: PutSubject): Promise<Subject> {
    return await this.rpcClient.subjects.update({ subjectId, ...input });
  }

  public async delete(subjectId: string): Promise<void> {
    await this.rpcClient.subjects.delete({ subjectId });
  }

  public async deleteBulk(subjectIds: string[]): Promise<void> {
    await this.rpcClient.subjects.deleteBulk({ subjectIds });
  }
}
