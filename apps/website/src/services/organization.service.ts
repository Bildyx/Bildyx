import { getRPCClient } from "./rpc";
import type {
  Organization,
  PostOrganization,
  PutOrganization,
} from "@repo/models/organizations";
import { EmployeeCountRange, OrganizationSubType } from "@prisma/client";

export class OrganizationService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    subtypes?: OrganizationSubType[];
    city?: string;
    country?: string;
    sizes?: EmployeeCountRange[];
    keyword?: string;
    productFilter?: "same" | "similar" | "different";
    userExperienceKeywords?: string[];
  }): Promise<Organization[]> {
    return await this.rpcClient.organizations.getAll(filters || {});
  }

  public async getById(organizationId: string): Promise<Organization> {
    return await this.rpcClient.organizations.getById({ organizationId });
  }

  public async create(input: PostOrganization): Promise<Organization> {
    return await this.rpcClient.organizations.create(input);
  }

  public async update(
    organizationId: string,
    input: PutOrganization,
  ): Promise<Organization> {
    return await this.rpcClient.organizations.update({
      organizationId,
      ...input,
    });
  }

  public async delete(organizationId: string): Promise<void> {
    await this.rpcClient.organizations.delete({ organizationId });
  }

  public async deleteBulk(organizationIds: string[]): Promise<void> {
    await this.rpcClient.organizations.deleteBulk({ organizationIds });
  }
}
