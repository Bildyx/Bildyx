import { getRPCClient } from "./rpc";
import type {
  OrganizationCustomer,
  PostOrganizationCustomer,
  PutOrganizationCustomer,
} from "@repo/models/organization_customers";

export class TeamCustomerService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    organization_id?: string;
    customer_id?: string;
  }): Promise<OrganizationCustomer[]> {
    return await this.rpcClient.organization_customers.getAll(filters || {} as any);
  }

  public async getById(
    organizationCustomerId: string,
  ): Promise<OrganizationCustomer> {
    return await this.rpcClient.organization_customers.getById({
      organizationCustomerId,
    });
  }

  public async create(
    input: PostOrganizationCustomer,
  ): Promise<OrganizationCustomer> {
    return await this.rpcClient.organization_customers.create(input);
  }

  public async update(
    organizationCustomerId: string,
    input: PutOrganizationCustomer,
  ): Promise<OrganizationCustomer> {
    return await this.rpcClient.organization_customers.update({
      organizationCustomerId,
      ...input,
    });
  }

  public async delete(organizationCustomerId: string): Promise<void> {
    await this.rpcClient.organization_customers.delete({
      organizationCustomerId,
    });
  }
}
