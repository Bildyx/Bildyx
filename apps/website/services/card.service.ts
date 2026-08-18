import { getRPCClient } from "@repo/api-client";

export class CardService {
  private readonly rpcClient = getRPCClient();

  public async getCountry(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getCountry({ id, extended })) as any;
  }

  public async getCity(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getCity({ id, extended })) as any;
  }

  public async getJob(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getJob({ id, extended })) as any;
  }

  public async getOrganization(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getOrganization({
      id,
      extended,
    })) as any;
  }

  public async getSkill(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getSkill({ id, extended })) as any;
  }

  public async getIndustry(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getIndustry({ id, extended })) as any;
  }

  public async getCertification(
    id: string,
    extended?: string,
  ): Promise<string> {
    return (await this.rpcClient.cards.getCertification({
      id,
      extended,
    })) as any;
  }

  public async getSubject(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getSubject({ id, extended })) as any;
  }

  public async getDegree(id: string, extended?: string): Promise<string> {
    return (await this.rpcClient.cards.getDegree({ id, extended })) as any;
  }
}
