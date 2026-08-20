import {
  ContactRequest,
  PostContactRequest,
} from "@repo/models/contact_requests";
import { getRPCClient } from "./rpc";

export class ContactRequestService {
  private readonly rpcClient = getRPCClient();

  public async getAll(): Promise<ContactRequest[]> {
    return await this.rpcClient.contact_requests.getAll({});
  }

  public async create(input: PostContactRequest): Promise<ContactRequest> {
    return await this.rpcClient.contact_requests.create(input);
  }

  public async delete(contactRequestId: string): Promise<void> {
    await this.rpcClient.contact_requests.delete({ contactRequestId });
  }
}
