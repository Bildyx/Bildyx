import { getRPCClient } from "@repo/api-client";
import type {
  TeamPartner,
  PostTeamPartner,
  PutTeamPartner,
} from "@repo/models/team_partners";

export class TeamPartnerService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: {
    team_id?: string;
    organization_id?: string;
  }): Promise<TeamPartner[]> {
    return await this.rpcClient.team_partners.getAll(filters || {});
  }

  public async getById(teamPartnerId: string): Promise<TeamPartner> {
    return await this.rpcClient.team_partners.getById({ teamPartnerId });
  }

  public async create(input: PostTeamPartner): Promise<TeamPartner> {
    return await this.rpcClient.team_partners.create(input);
  }

  public async update(
    teamPartnerId: string,
    input: PutTeamPartner,
  ): Promise<TeamPartner> {
    return await this.rpcClient.team_partners.update({
      teamPartnerId,
      ...input,
    });
  }

  public async delete(teamPartnerId: string): Promise<void> {
    await this.rpcClient.team_partners.delete({ teamPartnerId });
  }
}
