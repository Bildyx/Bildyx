import { apiDelete, apiGet } from "./httpClient";

export type User = {
  id: string;
  email: string;
  role?: "ADMIN" | "CANDIDATE" | "ORGANIZATION";
  status?: "ACTIVE" | "DELETED" | "PENDING_VERIFICATION" | "SUSPENDED";
  [key: string]: unknown;
};

/** See src/services/httpClient.ts — TODO: swap for the real @repo/api-client oRPC client. */
export class UserService {
  public getAll(filters?: { email?: string; role?: User["role"]; status?: User["status"] }) {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return apiGet<User[]>(`/users${params ? `?${params}` : ""}`);
  }

  public getById(userId: string) {
    return apiGet<User>(`/users/${userId}`);
  }

  public delete(userId: string) {
    return apiDelete<void>(`/users/${userId}`);
  }

  public deleteBulk(userIds: string[]) {
    return apiDelete<void>(`/users?ids=${userIds.join(",")}`);
  }
}
