import { getRPCClient } from "@repo/api-client";
import type {
  Country,
  PostCountry,
  PutCountry,
} from "@repo/models/countries";

export class CountryService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(): Promise<Country[]> {
    return await this.rpcClient.countries.getAll({});
  }

  public async getById(countryId: string): Promise<Country> {
    return await this.rpcClient.countries.getById({ countryId });
  }

  public async create(input: PostCountry): Promise<Country> {
    return await this.rpcClient.countries.create(input);
  }

  public async update(countryId: string, input: PutCountry): Promise<Country> {
    return await this.rpcClient.countries.update({ countryId, ...input });
  }

  public async delete(countryId: string): Promise<void> {
    await this.rpcClient.countries.delete({ countryId });
  }

  public async deleteBulk(countryIds: string[]): Promise<void> {
    await this.rpcClient.countries.deleteBulk({ countryIds });
  }
}
