import { getRPCClient } from "@repo/api-client";
import type {
  TeamInvestor,
  PostTeamInvestor,
  PutTeamInvestor,
} from "@repo/models/team_investors";

export class TeamInvestorService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    team_id?: string;
    organization_id?: string;
  }): Promise<TeamInvestor[]> {
    return await this.rpcClient.team_investors.getAll(filters || {});
  }

  public async getById(teamInvestorId: string): Promise<TeamInvestor> {
    return await this.rpcClient.team_investors.getById({ teamInvestorId });
  }

  public async create(input: PostTeamInvestor): Promise<TeamInvestor> {
    return await this.rpcClient.team_investors.create(input);
  }

  public async update(
    teamInvestorId: string,
    input: PutTeamInvestor,
  ): Promise<TeamInvestor> {
    return await this.rpcClient.team_investors.update({
      teamInvestorId,
      ...input,
    });
  }

  public async delete(teamInvestorId: string): Promise<void> {
    await this.rpcClient.team_investors.delete({ teamInvestorId });
  }
}
