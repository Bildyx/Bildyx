import { getRPCClient } from "@repo/api-client";
import type {
  Certification,
  PostCertification,
  PutCertification,
} from "@repo/models/certifications";

export class CertificationService {
  private readonly rpcClient = getRPCClient();

  public async getAll(): Promise<Certification[]> {
    return await this.rpcClient.certifications.getAll({});
  }

  public async getByOrganization(
    organizationId: string,
    filters?: {
      name?: string;
      category?:
        | "OTHER"
        | "TECHNICAL"
        | "PROFESSIONAL"
        | "PROJECTMANAGEMENT"
        | "VENDORPRODUCT"
        | "LANGUAGE";
    },
  ): Promise<Certification[]> {
    return await this.rpcClient.certifications.getByOrganization({
      organizationId,
      ...filters,
    });
  }

  public async getById(certificationId: string): Promise<Certification> {
    return await this.rpcClient.certifications.getById({ certificationId });
  }

  public async create(input: PostCertification): Promise<Certification> {
    return await this.rpcClient.certifications.create(input);
  }

  public async update(
    certificationId: string,
    input: PutCertification,
  ): Promise<Certification> {
    return await this.rpcClient.certifications.update({
      certificationId,
      ...input,
    });
  }

  public async delete(certificationId: string): Promise<void> {
    await this.rpcClient.certifications.delete({ certificationId });
  }

  public async deleteBulk(certificationIds: string[]): Promise<void> {
    await this.rpcClient.certifications.deleteBulk({ certificationIds });
  }
}
