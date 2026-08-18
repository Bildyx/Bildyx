import { getRPCClient } from "./rpc";
import type {
  TeamSubject,
  PostTeamSubject,
  PutTeamSubject,
} from "@repo/models/team_subjects";

export class TeamSubjectService {
  private readonly rpcClient = getRPCClient();

  public async getAll(filters?: {
    team_id?: string;
    subject_id?: string;
    status?: TeamSubject["status"];
  }): Promise<TeamSubject[]> {
    return await this.rpcClient.team_subjects.getAll(filters || {});
  }

  public async getById(teamSubjectId: string): Promise<TeamSubject> {
    return await this.rpcClient.team_subjects.getById({ teamSubjectId });
  }

  public async create(input: PostTeamSubject): Promise<TeamSubject> {
    return await this.rpcClient.team_subjects.create(input);
  }

  public async update(
    teamSubjectId: string,
    input: PutTeamSubject,
  ): Promise<TeamSubject> {
    return await this.rpcClient.team_subjects.update({
      teamSubjectId,
      ...input,
    });
  }

  public async delete(teamSubjectId: string): Promise<void> {
    await this.rpcClient.team_subjects.delete({ teamSubjectId });
  }
}
