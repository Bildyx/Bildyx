# Fusion University → Organization & pipeline d'import/export Excel

Récapitulatif de la conversation, depuis la question initiale sur la suppression du modèle `University`.

---

## 1. Question initiale : peut-on supprimer `University` ?

**Question posée** : les universités font partie de la table `Organization` (via `subtype = UNIVERSITY`) ; peut-on purement et simplement supprimer le modèle `University` ? Est-ce plus simple, ou est-ce risqué ?

**Ce qu'on gagne** :
- Fin de la duplication (`founded`/`established`, `city`/`countryId` vs `city_id`, `score`/`scoreUniversity`).
- Un seul modèle à requêter pour lister toutes les organisations, plus besoin d'`UNION` entre `Organization` et `University` côté recherche/listing.

**Ce qu'on risque** :
1. **Perte de la contrainte FK naturelle.** Le FK `UserEducations.university_id → University.id` garantissait, au niveau base de données, qu'un parcours éducatif pointe vers une vraie université. En pointant vers `Organization.id`, n'importe quelle organisation (armée, ONG, entreprise) devient une cible valide côté DB — la contrainte doit être recréée en code applicatif.
2. **Champs sans équivalent propre**, et incohérences déjà présentes : `Organization.undergraduates`/`graduates` avaient été ajoutés en `String`, alors que `University.undergraduates`/`postgraduates` étaient en `Int` — signe qu'`University` était en train d'être recréée en moins bien typé sur `Organization`, sans s'en rendre compte.
3. `type1`/`type2` sur `Organization` prennent alors tout leur sens : `UniversityType` (GRANDE_ECOLE, INSTITUTE, ACADEMY, ONLINE, OTHER) est exactement le genre de sous-classification que `type1` est censé porter selon le subtype (militaire, académique, etc.).

**Recommandation initiale (proposition A, non retenue au final)** : garder `University` en tant que table d'extension 1-1 (`AcademicProfile`) sur le modèle du pattern déjà utilisé pour `MilitaryCapabilities` (qui, vérification faite, n'existait finalement pas dans le `schema.prisma` réel malgré sa présence dans `generate_excel_templates.py` — incohérence relevée mais non résolue à ce stade).

---

## 2. Pipeline d'import Excel/CSV → base de données : comment automatiser la liaison entre tables

**Contexte** : le client final doit pouvoir remplir des fichiers Excel avec des organisations (dont universités), sans jamais avoir à gérer des UUID.

**Principe retenu** : clé naturelle (`slug`, `serial_number`, `isoCode`...) plutôt que clé technique (UUID) dans tous les fichiers manipulés par le client. Le pipeline résout les UUID en interne, jamais visible pour l'utilisateur.

**Architecture proposée (avant découverte des fichiers réels du projet)** :
- Un "registre" en mémoire (`Map<clé naturelle, UUID>`), reconstruit après chaque insertion en relisant la base (source de vérité = la DB, pas des UUID générés côté client).
- Insertion en deux passes pour les auto-références (ex. `Organization.parentOrganizationId`) : créer sans le parent, puis résoudre les liens une fois tous les slugs présents.
- Relations M2M gérées via une colonne texte `;`-séparée, résolue par clé naturelle.
- Argumentation contre la génération d'UUID déterministes côté client (`uuidv5`) : trop fragile face aux variations orthographiques, échoue silencieusement.

**Découverte du pipeline réellement existant** (upload de `generate_excel_templates.py`, `excel_to_csv.py`, `import.ts`, puis `run.ts`, `types.ts`, `adapters/index.ts`) : le système en place est déjà proche de cette architecture, en plus abouti :
- `generate_excel_templates.py` génère un template Excel verrouillé par modèle Prisma (colonnes = champs du schéma, validations par type, dropdowns pour les enums, mot de passe de protection).
- `import.ts` orchestre un import incrémental par `ImportAdapter` (un par modèle), avec plan (`toInsert`/`toUpdate`/`unchanged`/`rowErrors`/`orphans`), dry-run par défaut, `--commit`/`--allow-partial`/`--prune`.
- `ImportRowHash` (table Prisma) permet un diff incrémental idempotent (hash par ligne, réimport sans dupliquer).
- `afterUpsert` dans les adapters gère le cas `Organization.parentOrganizationId` (auto-référence) en deux passes, exactement comme anticipé.

**Bug identifié** : dans `generate_excel_templates.py`, la variable `is_uuid_fk` est calculée pour chaque champ FK scalaire (`@db.Uuid` + nom finissant par `Id`/`_id`) mais **n'est jamais utilisée nulle part** dans le reste du script. Conséquence concrète : les colonnes comme `city_id` ou `parent_organization_id` sortent dans le template Excel telles quelles en base — un champ où le client est censé écrire un UUID brut, ce qu'une personne non technique ne peut pas remplir correctement. C'est le problème central par rapport à l'objectif "le client ne doit jamais toucher un ID".

---

## 3. Décision finale : fusion complète, pas de table d'extension

Revirement par rapport à la proposition A : le client souhaite **garder les champs académiques (`undergraduates`, etc.) directement sur `Organization`**, sans table d'extension séparée, et supprimer `University` intégralement.

**Points tranchés** :
- **Typage corrigé** : `Organization.undergraduates`/`graduates` passent de `String?` à `Int?` (alignés sur les types de l'ancien `University`). `graduates` renommé `postgraduates`. Ajout de `studentCount`.
- **Champs volontairement non recréés** : `localName`, `notes`, `scoreUniversity` de `University` — jugés marginaux (concernent ~1% des lignes), `notes` chevauche `description`, `scoreUniversity` chevauche le `score` générique déjà présent.
- **`type1`** porte désormais l'ancien enum `UniversityType` **en `String` libre**, pas en enum contraint — cohérent avec son rôle de sous-catégorie dépendant du `subtype`, au prix de perdre la contrainte d'énumération stricte de Postgres.
- **`UserEducations.university_id` → `organization_id`**, pointant vers `Organization`.
- **Garde-fou nécessaire** : comme ce champ est rempli par les utilisateurs finaux du site (pas par le client dans un Excel contrôlé), plus aucune contrainte FK n'empêche qu'un bug ou un appel API direct enregistre une organisation non-universitaire comme parcours académique. Recommandation : validation serveur explicite (`organization.subtype === "UNIVERSITY"`) à l'écriture de `UserEducations`, en plus du filtre côté front (`Organization.findMany({ where: { subtype: "UNIVERSITY" } })`) — ne jamais faire confiance au seul filtre visuel.

**Script de migration des données existantes** fourni (`migrate-universities-to-organizations.ts`) : pour chaque ligne `University`, `upsert` une `Organization` correspondante (`subtype: "UNIVERSITY"`, champs académiques copiés/retypés), puis bascule des `UserEducations.university_id` vers le nouvel `organization_id`. À exécuter **avant** la migration Prisma qui supprime la colonne/la table.

**Ajustements du pipeline d'import évoqués** :
- Retirer `University` de `TARGET_MODELS` dans `generate_excel_templates.py`.
- Retirer `universitiesAdapter` de `adapters/index.ts`.
- Vérifier que `adapters/organizations.ts` (non fourni) gère bien les nouvelles colonnes `student_count`, `undergraduates`, `postgraduates` en `Int`.

---

## 4. Livraison du schéma Prisma final

Le client a fourni le `schema.prisma` complet ; livraison d'une version mise à jour intégrale (fichier `schema.prisma`) avec :
- `model University` supprimé (commentaire laissé à son emplacement pour traçabilité).
- `Organization` : `studentCount` ajouté, `undergraduates`/`postgraduates` en `Int`, relation `userEducations UserEducations[]` ajoutée.
- `UserEducations` : `university_id` → `organization_id`, relation vers `Organization`.
- `Country` et `City` : relations `universities University[]` retirées (cible supprimée).
- `enum UniversityType` supprimé (devenu orphelin), avec commentaire indiquant où recaser ces valeurs si besoin d'un dropdown front (constante applicative plutôt que schéma).

`prisma format` n'a pas pu être exécuté dans l'environnement (accès réseau bloqué vers les binaires du moteur Prisma) — à relancer côté client après récupération du fichier, sans risque (n'affecte que l'indentation).

---

## 5. Pré-remplissage des templates Excel avec les données actuelles de la BDD

**Nouvelle question** : comment permettre de télécharger un template Excel déjà rempli avec toutes les données actuelles de la base (pas un template vide), pour édition et réimport ?

**Architecture retenue** (pour rester DRY — une seule source de vérité sur "quelles colonnes, quel type, quelle clé naturelle cible", côté Python qui parse déjà `schema.prisma`) :

1. **`generate_excel_templates.py` (mis à jour)** :
   - Corrige enfin le bug `is_uuid_fk` : chaque FK scalaire est renommée dans le template pour pointer vers la clé naturelle de sa cible (`city_id` → `city_serial_number`, `parent_organization_id` → `parent_organization_slug`, etc.), via une table de correspondance `NATURAL_KEY_FIELD_BY_MODEL` (`Organization → slug`, `City → serial_number`, `Industry → serial_number`, `Country → isoCode`) et une résolution du modèle cible en repérant la ligne `@relation(fields: [...])` correspondante dans le schéma.
   - `University` retiré de `TARGET_MODELS` (avec commentaire expliquant pourquoi).
   - Nouveau mode `--dump-spec PATH` : écrit un JSON décrivant, par modèle cible, le nom de l'accesseur Prisma Client, le nom de table, le champ de soft-delete, et pour chaque colonne : son nom, le champ Prisma correspondant, son "kind" (`scalar`/`list`/`fk`/`m2m`) et, le cas échéant, la clé naturelle cible à aller chercher.
   - Nouveau mode `--populate-from-db DIR` : lit un `<table_name>.csv` par modèle dans `DIR` et pré-remplit le workbook généré à partir de la ligne 2, en conservant exactement le même verrouillage/validation qu'un template vide. Les valeurs sont castées vers le bon type Python (`int`/`float`/booléen `TRUE`/`FALSE`) pour un rendu Excel correct (tri, filtres).

2. **`export-current-data.ts` (nouveau script Node/Prisma)** : lit le JSON produit par `--dump-spec` et interroge Prisma Client dynamiquement (aucune liste de champs codée en dur par modèle) pour produire un CSV `;`-délimité par modèle, avec les mêmes noms de colonnes que les templates :
   - Champs scalaires/listes : sélectionnés directement.
   - FK : seule la clé naturelle de la cible est sélectionnée (jamais l'UUID brut, même en cas d'erreur dans le spec).
   - M2M : mêmes clés naturelles, jointes par `;`.
   - Filtrage des lignes soft-supprimées via le champ `deletedAtField` du spec.

**Workflow complet pour le client** :
```bash
# 1. Générer le spec JSON (une fois, ou à chaque changement de schéma)
python3 generate_excel_templates.py --dump-spec ./template-spec.json

# 2. Exporter les données actuelles de la BDD en CSV
tsx scripts/export-current-data.ts --spec ./template-spec.json --output ./data/exports

# 3. Générer les templates Excel pré-remplis, verrouillés et validés
python3 generate_excel_templates.py --populate-from-db ./data/exports
```

**Bug trouvé et corrigé pendant les tests** : `Organization.countries` (relation M2M vers `Country`) se retrouvait sans `targetNaturalKeyField`, car `Country` avait été volontairement exclu de `NATURAL_KEY_FIELD_BY_MODEL` — exclusion valable uniquement pour le cas "renommage de FK scalaire" (`Country` n'a d'ailleurs aucune FK scalaire `@db.Uuid`, sa PK étant `@db.Char(2)`), mais invalide pour la résolution des relations M2M, qui a besoin de savoir quel champ extraire des pays liés (`isoCode`). Correction : `Country: "isoCode"` réintégré dans `NATURAL_KEY_FIELD_BY_MODEL`. Vérifié par exécution de `--dump-spec` sur le schéma final : `Organization.countries` a bien `targetNaturalKeyField: "isoCode"` après correction.

**Point non vérifiable en l'état** : la convention exacte de délimiteur pour les champs de type liste/array dans les CSV existants (`;` supposé par cohérence avec `excel_to_csv.py` et `M2M_COLUMNS`, mais non confirmé faute d'accès à `csv.ts`/`utils.ts`/`plan.ts` du pipeline d'import).

---

## Fichiers livrés au cours de la conversation

- `schema.prisma` — schéma final avec `University` supprimé et champs académiques fusionnés dans `Organization`.
- `generate_excel_templates.py` — version corrigée (résolution FK, `--dump-spec`, `--populate-from-db`).
- `export-current-data.ts` — nouveau script d'export générique Node/Prisma.

## Reste à faire côté client

1. Exécuter le script de migration des données `University` → `Organization` + bascule `UserEducations` avant d'appliquer la migration Prisma.
2. Retirer `universitiesAdapter` de `adapters/index.ts` (pipeline d'import).
3. Vérifier/adapter `adapters/organizations.ts` pour les nouvelles colonnes académiques typées `Int`.
4. Ajouter la validation serveur `subtype === "UNIVERSITY"` sur l'écriture de `UserEducations`.
5. Lancer `npx prisma format` sur le schéma livré.
6. Tester le workflow `--dump-spec` → `export-current-data.ts` → `--populate-from-db` sur un environnement avec accès réel à la base et à `DATABASE_URL`.
