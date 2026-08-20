import { getRPCClient } from "./rpc";
import type {
  OrganizationSubsidiary,
  PostOrganizationSubsidiary,
  PutOrganizationSubsidiary,
} from "@repo/models/organization_subsidiaries";

export class OrganizationSubsidiaryService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    organization_id?: string;
    subsidiary_id?: string;
  }): Promise<OrganizationSubsidiary[]> {
    return await this.rpcClient.organization_subsidiaries.getAll(
      filters || ({} as any),
    );
  }

  public async getById(
    organizationSubsidiaryId: string,
  ): Promise<OrganizationSubsidiary> {
    return await this.rpcClient.organization_subsidiaries.getById({
      organizationSubsidiaryId,
    });
  }

  public async create(
    input: PostOrganizationSubsidiary,
  ): Promise<OrganizationSubsidiary> {
    return await this.rpcClient.organization_subsidiaries.create(input);
  }

  public async update(
    organizationSubsidiaryId: string,
    input: PutOrganizationSubsidiary,
  ): Promise<OrganizationSubsidiary> {
    return await this.rpcClient.organization_subsidiaries.update({
      organizationSubsidiaryId,
      ...input,
    });
  }

  public async delete(organizationSubsidiaryId: string): Promise<void> {
    await this.rpcClient.organization_subsidiaries.delete({
      organizationSubsidiaryId,
    });
  }
}
