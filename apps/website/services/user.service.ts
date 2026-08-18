import { getRPCClient } from "@repo/api-client";
import type { User, PostUser, PutUser } from "@repo/models/users";

export class UserService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    email?: string;
    role?: "ADMIN" | "CANDIDATE" | "ORGANIZATION";
    status?: "ACTIVE" | "DELETED" | "PENDING_VERIFICATION" | "SUSPENDED";
  }): Promise<User[]> {
    return await this.rpcClient.users.getAll(filters || {});
  }

  public async getById(userId: string): Promise<User> {
    return await this.rpcClient.users.getUserById({ userId });
  }

  public async create(input: PostUser): Promise<User> {
    return await this.rpcClient.users.create(input);
  }

  public async update(userId: string, input: PutUser): Promise<User> {
    return await this.rpcClient.users.update({ userId, ...input });
  }

  public async delete(userId: string): Promise<void> {
    await this.rpcClient.users.delete({ userId });
  }

  public async deleteBulk(userIds: string[]): Promise<void> {
    await this.rpcClient.users.deleteBulk({ userIds });
  }
}
