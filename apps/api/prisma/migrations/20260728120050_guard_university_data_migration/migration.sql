-- Garde-fou de la fusion University -> Organization.
--
-- La migration suivante (20260728120100_drop_university_after_data_migration)
-- supprime définitivement la table "universities" et la colonne
-- user_educations.university_id. Elle n'est valide QUE si
-- prisma/migrate-universities-to-organizations.ts a déjà tourné.
--
-- Jusqu'ici cette dépendance n'existait qu'en commentaire : un simple
-- `prisma migrate deploy` enchaînait 120000 puis 120100 et détruisait les
-- données universités sans que rien ne s'y oppose. Cette migration
-- intercalée transforme ce commentaire en contrainte : elle échoue
-- bruyamment plutôt que de laisser la suivante détruire des lignes non
-- migrées.
--
-- Sur une base neuve, "universities" est vide (elle vient d'être créée par
-- la migration init) et ce garde-fou passe sans rien faire.

DO $$
DECLARE
  university_count      BIGINT;
  migrated_count        BIGINT;
  dangling_education    BIGINT;
BEGIN
  -- Base sur laquelle la table n'existe déjà plus : rien à protéger.
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
