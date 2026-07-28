-- Hand-written (no live DB available in this environment - verified instead
-- via `prisma migrate diff --from-schema-datamodel <previous schema.prisma>
-- --to-schema-datamodel prisma/schema.prisma --script`, same precedent as
-- prior additive migrations in this project). Purely additive: 6 new tables
-- for the personality-tests feature (item bank + per-user results), no
-- existing table touched. Safe to apply anytime.
--
-- Config data (item bank, seeded separately): personality_tests,
-- personality_criteria (5 scored dimensions per test, specific to each
-- test), personality_questions (~30 Likert 1-5 questions per test, each
-- tied to the criterion it measures, with reverse_scored for inverted
-- items).
-- User data (cascades from user_profiles): personality_test_results (one
-- per user_profile+test - a retake overwrites the previous result, enforced
-- by the unique index), personality_answers (raw 1-5 score per question),
-- personality_criterion_scores (aggregated 0-100 score per criterion,
-- computed application-side from personality_answers).

-- CreateTable
CREATE TABLE "personality_tests" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personality_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_criteria" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "personality_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_questions" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "reverse_scored" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "personality_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_test_results" (
    "id" UUID NOT NULL,
    "user_profile_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personality_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_answers" (
    "id" UUID NOT NULL,
    "result_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "raw_score" INTEGER NOT NULL,

    CONSTRAINT "personality_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personality_criterion_scores" (
    "id" UUID NOT NULL,
    "result_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "personality_criterion_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personality_tests_code_key" ON "personality_tests"("code");

-- CreateIndex
CREATE INDEX "personality_criteria_test_id_idx" ON "personality_criteria"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "personality_criteria_test_id_code_key" ON "personality_criteria"("test_id", "code");

-- CreateIndex
CREATE INDEX "personality_questions_criterion_id_idx" ON "personality_questions"("criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "personality_questions_test_id_order_key" ON "personality_questions"("test_id", "order");

-- CreateIndex
CREATE INDEX "personality_test_results_test_id_idx" ON "personality_test_results"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "personality_test_results_user_profile_id_test_id_key" ON "personality_test_results"("user_profile_id", "test_id");

-- CreateIndex
CREATE INDEX "personality_answers_question_id_idx" ON "personality_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "personality_answers_result_id_question_id_key" ON "personality_answers"("result_id", "question_id");

-- CreateIndex
CREATE INDEX "personality_criterion_scores_criterion_id_idx" ON "personality_criterion_scores"("criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "personality_criterion_scores_result_id_criterion_id_key" ON "personality_criterion_scores"("result_id", "criterion_id");

-- AddForeignKey
ALTER TABLE "personality_criteria" ADD CONSTRAINT "personality_criteria_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "personality_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_questions" ADD CONSTRAINT "personality_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "personality_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_questions" ADD CONSTRAINT "personality_questions_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "personality_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_test_results" ADD CONSTRAINT "personality_test_results_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_test_results" ADD CONSTRAINT "personality_test_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "personality_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_answers" ADD CONSTRAINT "personality_answers_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "personality_test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_answers" ADD CONSTRAINT "personality_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "personality_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_criterion_scores" ADD CONSTRAINT "personality_criterion_scores_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "personality_test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personality_criterion_scores" ADD CONSTRAINT "personality_criterion_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "personality_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
