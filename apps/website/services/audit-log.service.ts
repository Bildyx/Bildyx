import { getRPCClient } from "./rpc";
import type { AuditLog } from "@repo/models/audit_logs";

export class AuditLogService {
  private readonly rpcClient = getRPCClient();

  public async get(filters?: {
    userId?: string;
    action?: string;
  }): Promise<AuditLog[]> {
    return await this.rpcClient.audit_logs.getAll(filters || {});
  }
}
