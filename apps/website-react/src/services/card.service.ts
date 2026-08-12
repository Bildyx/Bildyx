import { apiGet } from "./httpClient";

type CardKind = "country" | "city" | "job" | "organization" | "skill" | "industry" | "certification" | "subject" | "degree";

/** See src/services/httpClient.ts — TODO: swap for the real @repo/api-client oRPC client. */
export class CardService {
  private get(kind: CardKind, id: string, extended?: string) {
    const query = extended ? `?extended=${encodeURIComponent(extended)}` : "";
    return apiGet<string>(`/cards/${kind}/${id}${query}`);
  }

  public getCountry(id: string, extended?: string) { return this.get("country", id, extended); }
  public getCity(id: string, extended?: string) { return this.get("city", id, extended); }
  public getJob(id: string, extended?: string) { return this.get("job", id, extended); }
  public getOrganization(id: string, extended?: string) { return this.get("organization", id, extended); }
  public getSkill(id: string, extended?: string) { return this.get("skill", id, extended); }
  public getIndustry(id: string, extended?: string) { return this.get("industry", id, extended); }
  public getCertification(id: string, extended?: string) { return this.get("certification", id, extended); }
  public getSubject(id: string, extended?: string) { return this.get("subject", id, extended); }
  public getDegree(id: string, extended?: string) { return this.get("degree", id, extended); }
}
