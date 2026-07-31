import { getRPCClient } from "@repo/api-client";
import type {
  Skill,
  PostSkill,
  PutSkill,
} from "@repo/models/skills";

export class SkillService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(): Promise<Skill[]> {
    return await this.rpcClient.skills.getAll({});
  }

  public async getById(skillId: string): Promise<Skill> {
    return await this.rpcClient.skills.getById({ skillId });
  }

  public async create(input: PostSkill): Promise<Skill> {
    return await this.rpcClient.skills.create(input);
  }

  public async update(skillId: string, input: PutSkill): Promise<Skill> {
    return await this.rpcClient.skills.update({ skillId, ...input });
  }

  public async delete(skillId: string): Promise<void> {
    await this.rpcClient.skills.delete({ skillId });
  }

  public async deleteBulk(skillIds: string[]): Promise<void> {
    await this.rpcClient.skills.deleteBulk({ skillIds });
  }
}
