import { getRPCClient } from "@repo/api-client";
import type {
  TeamSubsidiary,
  PostTeamSubsidiary,
  PutTeamSubsidiary,
} from "@repo/models/team_subsidiaries";

export class TeamSubsidiaryService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    team_id?: string;
    organization_id?: string;
  }): Promise<TeamSubsidiary[]> {
    return await this.rpcClient.team_subsidiaries.getAll(filters || {});
  }

  public async getById(teamSubsidiaryId: string): Promise<TeamSubsidiary> {
    return await this.rpcClient.team_subsidiaries.getById({ teamSubsidiaryId });
  }

  public async create(input: PostTeamSubsidiary): Promise<TeamSubsidiary> {
    return await this.rpcClient.team_subsidiaries.create(input);
  }

  public async update(
    teamSubsidiaryId: string,
    input: PutTeamSubsidiary,
  ): Promise<TeamSubsidiary> {
    return await this.rpcClient.team_subsidiaries.update({
      teamSubsidiaryId,
      ...input,
    });
  }

  public async delete(teamSubsidiaryId: string): Promise<void> {
    await this.rpcClient.team_subsidiaries.delete({ teamSubsidiaryId });
  }
}
