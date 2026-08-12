import { getRPCClient } from "@repo/api-client";
import type {
  TeamProfile,
  PostTeamProfile,
  PutTeamProfile,
} from "@repo/models/team_profiles";

export class TeamProfileService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: { team_id?: string }): Promise<TeamProfile[]> {
    return await this.rpcClient.team_profiles.getAll(filters || {});
  }

  public async getById(teamProfileId: string): Promise<TeamProfile> {
    return await this.rpcClient.team_profiles.getById({ teamProfileId });
  }

  public async create(input: PostTeamProfile): Promise<TeamProfile> {
    return await this.rpcClient.team_profiles.create(input);
  }

  public async update(
    teamProfileId: string,
    input: PutTeamProfile,
  ): Promise<TeamProfile> {
    return await this.rpcClient.team_profiles.update({
      teamProfileId,
      ...input,
    });
  }

  public async delete(teamProfileId: string): Promise<void> {
    await this.rpcClient.team_profiles.delete({ teamProfileId });
  }
}
