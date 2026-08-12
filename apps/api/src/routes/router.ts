import { publicProcedure } from "../oRPC";
import { auth } from "./auth";
import { certifications } from "./certifications";
import { cities } from "./cities";
import { countries } from "./countries";
import { degrees } from "./degrees";
import { industries } from "./industries";
import { jobs } from "./jobs";
import { job_ads } from "./job_ads";
import { job_ads_skills } from "./job_ads_skills";
import { subjects } from "./subjects";
import { skills } from "./skills";
import { organizations } from "./organizations";
import { users } from "./users";
import { user_sessions } from "./user_sessions";
import { user_profiles } from "./user_profiles";
import { user_educations } from "./user_educations";
import { user_education_fields } from "./user_education_fields";
import { user_certifications } from "./user_certifications";
import { user_languages } from "./user_languages";
import { user_skills } from "./user_skills";
import { user_experiences } from "./user_experiences";
import { audit_logs } from "./audit_logs";
import { cards } from "./cards";
import { personalityTests } from "./personality_tests";
import { personalityCriteria } from "./personality_criteria";
import { personalityQuestions } from "./personality_questions";
import { personalityTestResults } from "./personality_test_results";
import { personalityAnswers } from "./personality_answers";
import { personalityCriterionScores } from "./personality_criterion_scores";
import { user_target_lists } from "./user_target_lists";
import { teams } from "./teams";
import { team_customers } from "./team_customers";
import { team_investors } from "./team_investors";
import { team_members } from "./team_members";
import { team_offices } from "./team_offices";
import { team_partners } from "./team_partners";
import { team_photos } from "./team_photos";
import { team_profiles } from "./team_profiles";
import { team_subjects } from "./team_subjects";
import { team_subsidiaries } from "./team_subsidiaries";

export const router = publicProcedure.router({
  auth,
  certifications,
  cities,
  countries,
  degrees,
  industries,
  jobs,
  job_ads,
  job_ads_skills,
  subjects,
  skills,
  organizations,
  users,
  user_sessions,
  user_profiles,
  user_educations,
  user_education_fields,
  user_certifications,
  user_languages,
  user_skills,
  user_experiences,
  audit_logs,
  cards,
  personalityTests,
  personalityCriteria,
  personalityQuestions,
  personalityTestResults,
  personalityAnswers,
  personalityCriterionScores,
  user_target_lists,
  teams,
  team_customers,
  team_investors,
  team_members,
  team_offices,
  team_partners,
  team_photos,
  team_profiles,
  team_subjects,
  team_subsidiaries,
});
export type Router = typeof router;
