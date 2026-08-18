import { getRPCClient } from "@repo/api-client";
import type {
  TeamMember,
  PostTeamMember,
  PutTeamMember,
} from "@repo/models/team_members";

export class TeamMemberService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    team_id?: string;
    fullname?: string;
  }): Promise<TeamMember[]> {
    return await this.rpcClient.team_members.getAll(filters || {});
  }

  public async getById(teamMemberId: string): Promise<TeamMember> {
    return await this.rpcClient.team_members.getById({ teamMemberId });
  }

  public async create(input: PostTeamMember): Promise<TeamMember> {
    return await this.rpcClient.team_members.create(input);
  }

  public async update(
    teamMemberId: string,
    input: PutTeamMember,
  ): Promise<TeamMember> {
    return await this.rpcClient.team_members.update({
      teamMemberId,
      ...input,
    });
  }

  public async delete(teamMemberId: string): Promise<void> {
    await this.rpcClient.team_members.delete({ teamMemberId });
  }
}
