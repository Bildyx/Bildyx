-- Corrections de cohérence issues de l'audit base de données.
--
-- Écrite à la main plutôt que générée : `prisma migrate diff` propose des
-- DROP/CREATE là où un ALTER suffit, ce qui perdrait les lignes existantes.
-- Le résultat est vérifié en rejouant toute la chaîne de migrations puis en
-- la comparant au datamodel (`npm run db:check-drift`).
--
-- NON INCLUS ICI, volontairement (dette assumée, chantier API distinct) :
--   * cities.number_of_airports INTEGER -> TEXT et
--     organizations.members / personnel INTEGER -> TEXT. Les données sources
--     sont du texte libre ("20+", "Thousands", "~6 million") : le typage
--     entier est faux. Mais src/models/cities.ts et
--     src/models/organizations.ts valident ces champs en z.number().int(),
--     et src/db/types.ts les déclare `number` : changer le type en base
--     casserait les GET correspondants. L'import se contente donc de
--     signaler ces cellules en avertissement et d'écrire null.
--   * cities.currency NOT NULL -> nullable, pour la même raison
--     (src/models/cities.ts impose z.string().length(3)).
--   * le renommage de la table "StudyFields"
--     en study_fields et de la colonne user_education_fields.study_field_Id en
--     study_field_id, dont dépendent src/db/types.ts (généré par
--     kysely-codegen), src/models/user_education_fields.ts et
--     src/routes/user_education_fields.ts.

-- 3. countries.iso_code portait @id ET @unique : l'index unique redondant
--    doublonnait celui de la clé primaire.
DROP INDEX IF EXISTS "countries_iso_code_key";

-- 3bis. Reliquat du renommage _CountryLargestOrganizations ->
--    _OrganizationCountries (migrations 20260714000000 et 20260718175659) :
--    la table, sa PK et son index B avaient été renommés, mais pas les deux
--    contraintes de clé étrangère, restées sous l'ancien nom. Détecté par
--    `npm run db:check-drift`.
ALTER TABLE "_OrganizationCountries" RENAME CONSTRAINT "_CountryLargestOrganizations_A_fkey" TO "_OrganizationCountries_A_fkey";
ALTER TABLE "_OrganizationCountries" RENAME CONSTRAINT "_CountryLargestOrganizations_B_fkey" TO "_OrganizationCountries_B_fkey";

-- 4. user_profiles.deleted_at : soft-delete présent sur la quasi-totalité
--    des modèles mais absent de celui-ci.
ALTER TABLE "user_profiles" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- 5. personality_questions portait test_id ET criterion_id sans rien
--    garantir que le critère appartienne au même test. La FK composite
--    ci-dessous rend l'incohérence impossible au niveau base.
--    Prérequis : purger d'abord les lignes déjà incohérentes (aucune en
--    pratique, la table n'est pas encore peuplée) pour que la FK s'applique.
DELETE FROM "personality_questions" q
WHERE NOT EXISTS (
  SELECT 1 FROM "personality_criteria" c
  WHERE c."id" = q."criterion_id" AND c."test_id" = q."test_id"
);

CREATE UNIQUE INDEX "personality_criteria_test_id_id_key" ON "personality_criteria"("test_id", "id");

ALTER TABLE "personality_questions" DROP CONSTRAINT "personality_questions_criterion_id_fkey";
ALTER TABLE "personality_questions" ADD CONSTRAINT "personality_questions_test_id_criterion_id_fkey" FOREIGN KEY ("test_id", "criterion_id") REFERENCES "personality_criteria"("test_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
