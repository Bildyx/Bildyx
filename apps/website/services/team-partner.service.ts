import { getRPCClient } from "./rpc";
import type {
  OrganizationPartner,
  PostOrganizationPartner,
  PutOrganizationPartner,
} from "@repo/models/organization_partners";

export class TeamPartnerService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    organization_id?: string;
    partner_id?: string;
  }): Promise<OrganizationPartner[]> {
    return await this.rpcClient.organization_partners.getAll(filters || {} as any);
  }

  public async getById(organizationPartnerId: string): Promise<OrganizationPartner> {
    return await this.rpcClient.organization_partners.getById({ organizationPartnerId });
  }

  public async create(input: PostOrganizationPartner): Promise<OrganizationPartner> {
    return await this.rpcClient.organization_partners.create(input);
  }

  public async update(
    organizationPartnerId: string,
    input: PutOrganizationPartner,
  ): Promise<OrganizationPartner> {
    return await this.rpcClient.organization_partners.update({
      organizationPartnerId,
      ...input,
    });
  }

  public async delete(organizationPartnerId: string): Promise<void> {
    await this.rpcClient.organization_partners.delete({ organizationPartnerId });
  }
}
