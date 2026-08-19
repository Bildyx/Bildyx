import { getRPCClient } from "./rpc";
import type { Team, PostTeam, PutTeam } from "@repo/models/teams";

export class TeamService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    type?: string;
    city_id?: string;
  }): Promise<Team[]> {
    return await this.rpcClient.teams.getAll(filters || {});
  }

  public async getById(teamId: string): Promise<Team> {
    return await this.rpcClient.teams.getById({ teamId });
  }

  public async create(input: PostTeam): Promise<Team> {
    return await this.rpcClient.teams.create(input);
  }

  public async update(teamId: string, input: PutTeam): Promise<Team> {
    return await this.rpcClient.teams.update({ teamId, ...input });
  }

  public async delete(teamId: string): Promise<void> {
    await this.rpcClient.teams.delete({ teamId });
  }
}
