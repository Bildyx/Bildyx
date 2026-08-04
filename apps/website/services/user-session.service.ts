import { getRPCClient } from "@repo/api-client";
import type {
  UserSession,
  PostUserSession,
} from "@repo/models/user_sessions";

export class UserSessionService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getByUser(userId: string): Promise<UserSession[]> {
    return await this.rpcClient.user_sessions.getByUser({ userId });
  }

  public async create(input: PostUserSession): Promise<UserSession> {
    return await this.rpcClient.user_sessions.create(input);
  }

  public async delete(sessionId: string): Promise<UserSession> {
    return await this.rpcClient.user_sessions.delete({ sessionId });
  }
}
