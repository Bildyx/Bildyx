import { apiDelete, apiGet, apiPost } from "./httpClient";

export type PersonalityTest = { id: string; code: string; name: string; description?: string };
export type PersonalityQuestion = { id: string; order: number; text: string; criterion_id: string; reverse_scored?: boolean };
export type PersonalityCriterion = { id: string; code: string; name: string };
export type SavedAnswers = { result: unknown; answers: Record<string, string | number>; scores: Record<string, number> };
export type TestSummaryItem = { test_id: string; code: string; name: string; description?: string; is_completed: boolean };

/** Paths match apps/api/src/routes/personality_test_results.ts, personality_questions.ts, personality_criteria.ts, personality_tests.ts */
export class PersonalityService {
  public getTestsSummary(userProfileId: string) {
    return apiGet<TestSummaryItem[]>(`/personality-test-results/summary?user_profile_id=${userProfileId}`);
  }

  public getSavedAnswers(userProfileId: string, testCode: string) {
    return apiGet<SavedAnswers>(`/personality-test-results/saved?user_profile_id=${userProfileId}&test_code=${testCode}`);
  }

  public submitResult(userProfileId: string, testCode: string, answers: Record<string, string | number>) {
    return apiPost<{ success: boolean; result_id: string }>("/personality-test-results/submit", {
      user_profile_id: userProfileId,
      test_code: testCode,
      answers,
    });
  }

  public deleteByTestCode(userProfileId: string, testCode: string) {
    return apiDelete<{ success: boolean }>(`/personality-test-results/delete-by-code?user_profile_id=${userProfileId}&test_code=${testCode}`);
  }

  public getQuestionsByTestId(testId: string) {
    return apiGet<PersonalityQuestion[]>(`/personality-questions?test_id=${testId}`);
  }

  public getCriteriaByTestId(testId: string) {
    return apiGet<PersonalityCriterion[]>(`/personality-criteria?test_id=${testId}`);
  }

  public getTestByCode(code: string) {
    return apiGet<PersonalityTest[]>(`/personality-tests?code=${code}`);
  }
}
