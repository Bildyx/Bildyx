import { getRPCClient } from "@repo/api-client";
import type {
  TeamPhoto,
  PostTeamPhoto,
  PutTeamPhoto,
} from "@repo/models/team_photos";

export class TeamPhotoService {
  private readonly rpcClient = getRPCClient("http://localhost:3000");

  public async getAll(filters?: { team_id?: string }): Promise<TeamPhoto[]> {
    return await this.rpcClient.team_photos.getAll(filters || {});
  }

  public async getById(teamPhotoId: string): Promise<TeamPhoto> {
    return await this.rpcClient.team_photos.getById({ teamPhotoId });
  }

  public async create(input: PostTeamPhoto): Promise<TeamPhoto> {
    return await this.rpcClient.team_photos.create(input);
  }

  public async update(
    teamPhotoId: string,
    input: PutTeamPhoto,
  ): Promise<TeamPhoto> {
    return await this.rpcClient.team_photos.update({ teamPhotoId, ...input });
  }

  public async delete(teamPhotoId: string): Promise<void> {
    await this.rpcClient.team_photos.delete({ teamPhotoId });
  }
}
