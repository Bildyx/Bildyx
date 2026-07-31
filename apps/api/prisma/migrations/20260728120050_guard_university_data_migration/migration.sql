-- Guard for the University -> Organization merge.
--
-- The next migration (20260728120100_drop_university_after_data_migration)
-- permanently drops the "universities" table and the
-- user_educations.university_id column. It is only valid IF
-- prisma/migrate-universities-to-organizations.ts has already run.
--
-- Until now this dependency existed only as a comment: a plain
-- `prisma migrate deploy` chained 120000 then 120100 and destroyed the
-- university data with nothing standing in its way. This intermediate
-- migration turns that comment into a constraint: it fails loudly rather
-- than letting the next one destroy unmigrated rows.
--
-- On a fresh database, "universities" is empty (it has just been created by
-- the init migration) and this guard passes without doing anything.

DO $$
DECLARE
  university_count      BIGINT;
  migrated_count        BIGINT;
  dangling_education    BIGINT;
BEGIN
  -- Database where the table no longer exists: nothing to protect.
  IF to_regclass('public.universities') IS NULL THEN
    RETURN;
  END IF;

  EXECUTE 'SELECT count(*) FROM universities' INTO university_count;

  IF university_count = 0 THEN
    RETURN;
  END IF;

  SELECT count(*) INTO migrated_count
  FROM organizations
  WHERE subtype = 'UNIVERSITY';

  EXECUTE $q$
    SELECT count(*) FROM user_educations
    WHERE university_id IS NOT NULL AND organization_id IS NULL
  $q$ INTO dangling_education;

  IF migrated_count < university_count OR dangling_education > 0 THEN
    RAISE EXCEPTION
      'Migration de données universités -> organisations non effectuée : % universite(s) en base, % organisation(s) subtype=UNIVERSITY, % ligne(s) user_educations non repointee(s). Lancez d''abord `npx tsx prisma/migrate-universities-to-organizations.ts` (option --dry-run pour prévisualiser), puis relancez `prisma migrate deploy`.',
      university_count, migrated_count, dangling_education;
  END IF;
END
$$;
