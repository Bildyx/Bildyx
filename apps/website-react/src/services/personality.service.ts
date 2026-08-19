import { getRPCClient } from "./rpc";

export class PersonalityService {
  private readonly rpcClient = getRPCClient();

  public async getTestsSummary(userProfileId: string) {
    return await this.rpcClient.personalityTestResults.getTestsSummary({
      user_profile_id: userProfileId,
    });
  }

  public async getSavedAnswers(userProfileId: string, testCode: string) {
    return await this.rpcClient.personalityTestResults.getSavedAnswers({
      user_profile_id: userProfileId,
      test_code: testCode,
    });
  }

  public async submitResult(
    userProfileId: string,
    testCode: string,
    answers: Record<string, string | number>,
  ) {
    return await this.rpcClient.personalityTestResults.submitResult({
      user_profile_id: userProfileId,
      test_code: testCode,
      answers,
    });
  }

  public async deleteByTestCode(userProfileId: string, testCode: string) {
    return await this.rpcClient.personalityTestResults.deleteByTestCode({
      user_profile_id: userProfileId,
      test_code: testCode,
    });
  }

  public async getQuestionsByTestId(testId: string) {
    return await this.rpcClient.personalityQuestions.getAll({
      test_id: testId,
    });
  }

  public async getCriteriaByTestId(testId: string) {
    return await this.rpcClient.personalityCriteria.getAll({
      test_id: testId,
    });
  }

  public async getTestByCode(code: string) {
    return await this.rpcClient.personalityTests.getAll({
      code,
    });
  }
}
