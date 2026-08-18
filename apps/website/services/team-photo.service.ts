import { getRPCClient } from "@repo/api-client";
import type {
  OrganizationPhoto,
  PostOrganizationPhoto,
  PutOrganizationPhoto,
} from "@repo/models/organization_photos";

export class TeamPhotoService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    organization_id?: string;
  }): Promise<OrganizationPhoto[]> {
    return await this.rpcClient.organization_photos.getAll(filters || {} as any);
  }

  public async getById(organizationPhotoId: string): Promise<OrganizationPhoto> {
    return await this.rpcClient.organization_photos.getById({ organizationPhotoId });
  }

  public async create(input: PostOrganizationPhoto): Promise<OrganizationPhoto> {
    return await this.rpcClient.organization_photos.create(input);
  }

  public async update(
    organizationPhotoId: string,
    input: PutOrganizationPhoto,
  ): Promise<OrganizationPhoto> {
    return await this.rpcClient.organization_photos.update({
      organizationPhotoId,
      ...input,
    });
  }

  public async delete(organizationPhotoId: string): Promise<void> {
    await this.rpcClient.organization_photos.delete({ organizationPhotoId });
  }
}
