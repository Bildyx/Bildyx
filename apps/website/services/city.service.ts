import { getRPCClient } from "./rpc";
import type {
  City,
  CityListItem,
  PostCity,
  PutCity,
} from "@repo/models/cities";

export class CityService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    name?: string;
    country_id?: string;
  }): Promise<CityListItem[]> {
    return await this.rpcClient.cities.getAll(filters || {});
  }

  public async getById(cityId: string): Promise<City> {
    return await this.rpcClient.cities.getById({ cityId });
  }

  public async create(input: PostCity): Promise<City> {
    return await this.rpcClient.cities.create(input);
  }

  public async update(cityId: string, input: PutCity): Promise<City> {
    return await this.rpcClient.cities.update({ cityId, ...input });
  }

  public async delete(cityId: string): Promise<void> {
    await this.rpcClient.cities.delete({ cityId });
  }

  public async deleteBulk(cityIds: string[]): Promise<void> {
    await this.rpcClient.cities.deleteBulk({ cityIds });
  }
}
