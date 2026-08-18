import { getRPCClient } from "@repo/api-client";
import type {
  TeamOffice,
  PostTeamOffice,
  PutTeamOffice,
} from "@repo/models/team_offices";

export class TeamOfficeService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    city_id?: string;
    type?: string;
  }): Promise<TeamOffice[]> {
    return await this.rpcClient.team_offices.getAll(filters || {});
  }

  public async getById(teamOfficeId: string): Promise<TeamOffice> {
    return await this.rpcClient.team_offices.getById({ teamOfficeId });
  }

  public async create(input: PostTeamOffice): Promise<TeamOffice> {
    return await this.rpcClient.team_offices.create(input);
  }

  public async update(
    teamOfficeId: string,
    input: PutTeamOffice,
  ): Promise<TeamOffice> {
    return await this.rpcClient.team_offices.update({
      teamOfficeId,
      ...input,
    });
  }

  public async delete(teamOfficeId: string): Promise<void> {
    await this.rpcClient.team_offices.delete({ teamOfficeId });
  }
}
