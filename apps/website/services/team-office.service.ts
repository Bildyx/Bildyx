import { getRPCClient } from "./rpc";
import type {
  OrganizationOffice,
  PostOrganizationOffice,
  PutOrganizationOffice,
} from "@repo/models/organization_offices";

export class TeamOfficeService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    city_id?: string;
    type?: string;
  }): Promise<OrganizationOffice[]> {
    return await this.rpcClient.organization_offices.getAll(filters || {} as any);
  }

  public async getById(organizationOfficeId: string): Promise<OrganizationOffice> {
    return await this.rpcClient.organization_offices.getById({ organizationOfficeId });
  }

  public async create(input: PostOrganizationOffice): Promise<OrganizationOffice> {
    return await this.rpcClient.organization_offices.create(input);
  }

  public async update(
    organizationOfficeId: string,
    input: PutOrganizationOffice,
  ): Promise<OrganizationOffice> {
    return await this.rpcClient.organization_offices.update({
      organizationOfficeId,
      ...input,
    });
  }

  public async delete(organizationOfficeId: string): Promise<void> {
    await this.rpcClient.organization_offices.delete({ organizationOfficeId });
  }
}
