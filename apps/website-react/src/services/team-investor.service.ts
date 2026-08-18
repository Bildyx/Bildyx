import { getRPCClient } from "@repo/api-client";
import type {
  OrganizationInvestor,
  PostOrganizationInvestor,
  PutOrganizationInvestor,
} from "@repo/models/organization_investors";

export class TeamInvestorService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: {
    organization_id?: string;
    investor_id?: string;
  }): Promise<OrganizationInvestor[]> {
    return await this.rpcClient.organization_investors.getAll(filters || {} as any);
  }

  public async getById(organizationInvestorId: string): Promise<OrganizationInvestor> {
    return await this.rpcClient.organization_investors.getById({ organizationInvestorId });
  }

  public async create(input: PostOrganizationInvestor): Promise<OrganizationInvestor> {
    return await this.rpcClient.organization_investors.create(input);
  }

  public async update(
    organizationInvestorId: string,
    input: PutOrganizationInvestor,
  ): Promise<OrganizationInvestor> {
    return await this.rpcClient.organization_investors.update({
      organizationInvestorId,
      ...input,
    });
  }

  public async delete(organizationInvestorId: string): Promise<void> {
    await this.rpcClient.organization_investors.delete({ organizationInvestorId });
  }
}
