import { getRPCClient } from "@repo/api-client";
import type {
  TeamCustomer,
  PostTeamCustomer,
  PutTeamCustomer,
} from "@repo/models/team_customers";

export class TeamCustomerService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    team_id?: string;
    organization_id?: string;
  }): Promise<TeamCustomer[]> {
    return await this.rpcClient.team_customers.getAll(filters || {});
  }

  public async getById(teamCustomerId: string): Promise<TeamCustomer> {
    return await this.rpcClient.team_customers.getById({ teamCustomerId });
  }

  public async create(input: PostTeamCustomer): Promise<TeamCustomer> {
    return await this.rpcClient.team_customers.create(input);
  }

  public async update(
    teamCustomerId: string,
    input: PutTeamCustomer,
  ): Promise<TeamCustomer> {
    return await this.rpcClient.team_customers.update({
      teamCustomerId,
      ...input,
    });
  }

  public async delete(teamCustomerId: string): Promise<void> {
    await this.rpcClient.team_customers.delete({ teamCustomerId });
  }
}
