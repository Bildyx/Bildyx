# Bildyx — Migration React (feat/react-migration)

Remplacement complet du site PHP (`apps/website`) par une app React/TS
(Vite + React Router), à placer dans `apps/website-react/`.

## Lancer le projet

```bash
cd apps/website-react
npm install
npm run dev
```

## Ce qui est fait ✅

| Page PHP                | Route React        | Statut |
|--------------------------|---------------------|--------|
| `includes/header.php`    | `src/components/Header.tsx` | ✅ (session/auth portée dans `useAuthNav.ts`) |
| `includes/footer.php`    | `src/components/Footer.tsx` | ✅ |
| `index.php` + `js/home.ts` | `/` | ✅ (tabs équipes, offices, produits, overview/operate) |
| `mission.php`            | `/mission`          | ✅ |
| `company.php`            | `/company`          | ✅ |
| `contact.php` + `js/contact.ts` | `/contact`   | ✅ (form géré en state React, `TODO` brancher le backend) |
| `privacy-policy.php`     | `/privacy-policy`   | ✅ |
| `terms-service.php`      | `/terms-service`    | ✅ |
| `why-built-it.php`       | `/why-built-it`     | ✅ |
| `generic.php`             | `/coming-soon/:page`| ✅ |
| `forgot-password.php` + `js/forgot-password.ts` | `/forgot-password` | ✅ (captcha + AuthService) |
| `reset-password.php` + `js/reset-password.ts`   | `/reset-password`  | ✅ (captcha + AuthService) |
| `verify-email.php` + `js/verify-email.ts`       | `/verify-email`    | ✅ (garde beforeunload, annulation compte non vérifié) |
| `company-archives.php`   | `/company-archives` | ✅ |
| `company_archive_true.php` | `/company-archive-connected` | ✅ |
| `microresume.php` + `js/microresume.ts`         | `/microresume`      | ✅ (smart-login, ancre scroll fluide) |
| `microresume-example.php` + `js/microresume-example.ts` | `/microresume-example` | ✅ (header icône compte) |
| `why-teams.php` + `js/why-teams.ts`             | `/why-teams`         | ✅ (widget équipes interactif) |
| `team-example.php` + `js/team-example.ts`       | `/team-example`      | ✅ (4 équipes, carrousels statiques comme l'original) |
| `my-jobs.php` + `js/my-jobs.ts`                 | `/my-jobs`           | ✅ (sélection job, apply toggle) |
| `target-list.php` + `js/target-list.ts`         | `/target-list`       | ✅ (filtres, matching, cartes via iframe) |
| `company_con.php` + `js/company_con.ts`         | `/company-con`       | ✅ (lit le profil localStorage sauvegardé par l'admin — vide tant que `company_con_admin` n'est pas migré) |
| `login.php` + `js/auth.ts` (partie login/signup) | `/login`            | ✅ (tabs, radio compte, force du mot de passe, Google popup, rate limiting, redirection selon le type de compte) |
| `tests-preferences.php` + `js/tests-preferences.ts` | `/tests-preferences` | ✅ (liste des tests, statuts, lien résultat) |
| `tests-preferences/test.php` + `js/test-form.ts` | `/tests-preferences/test` | ✅ (questionnaire dynamique, sauvegarde locale + backend, discard) |
| `tests-preferences/result.php` + `js/result.ts` | `/tests-preferences/result` | ✅ (scores + génération PDF pixel-perfect — module quasi inchangé, voir note ci-dessous) |
| `profile.php` + `js/profile.ts` + `js/profile/*.ts` | `/profile` | ✅ (voir note de simplification ci-dessous) |
| `company_con_admin.php` + `js/company_con_admin.ts` — **Lot A** (teams, membres, offices, produits, team profile) | `/company-admin` | ✅ (voir note ci-dessous) |
| `company_con_admin.php` + `js/company_con_admin.ts` — **Lot B** (portfolio, photos, partners, customers, investors, subsidiaries) | `/company-admin` | ✅ |

Toutes les autres pages ont une route **placeholder** (`NotYetMigrated`) pour
que la navigation ne casse jamais pendant la migration.

## Nouveau : services API

`src/services/httpClient.ts`, `auth.service.ts`, `user.service.ts` sont des
wrappers `fetch` **temporaires**. Les vrais fichiers `apps/website/services/*`
importent `@repo/api-client` et `@repo/models/*`, mais seul
`packages/api-client` existe pour l'instant dans le monorepo (pas de
`packages/models`, et `packages/*` n'est même pas listé dans les
`workspaces` du `package.json` racine). Ces wrappers ont exactement les
mêmes noms de méthodes (`login`, `signup`, `forgotPassword`, `getById`,
etc.) — quand `@repo/models` existera, il suffira de réécrire l'intérieur de
ces deux fichiers sans toucher aux pages qui les consomment.

## Nouveau : helpers partagés portés en React

- `src/lib/toast.ts` — même logique Toastify (chargement CDN) que
  `js/helpers.ts`.
- `src/lib/formHelpers.ts` — `validEmail`, `passwordScore`,
  `extractErrorMessage` (parsing `err.message` en JSON comme l'original).
- `src/hooks/useCaptcha.ts` — équivalent React de
  `generateCaptcha`/`checkCaptcha` (state au lieu de requêtes DOM).
- `src/components/AuthLayout.tsx` — le panneau de marque partagé par
  forgot/reset/verify-email (dupliqué 3× en PHP, mutualisé ici).
- `Header`/`Footer` ont de nouvelles props optionnelles pour couvrir les
  variantes : `brandSuffix` (ex. "MicroResume"), `centerNav` (liens
  d'ancre), `simpleAccountIcon` (remplace toute la nav par l'icône compte,
  utilisé par MicroResume Example).


## Ce qu'il reste à faire (par ordre de priorité suggéré)

Classé par volume de code à porter (PHP + TS) :

| Page                        | PHP   | TS    | Complexité | Notes |
|------------------------------|-------|-------|------------|-------|
| `login.php`                  | 233   | 800 (`auth.ts`) | 🔴 Élevée | tabs login/signup, validation, appel API |
| `company_con_admin.php`      | 821   | 2547  | 🔴 Très élevée | dashboard admin complet — à découper en sous-composants |
| `profile.php`                 | 194   | 935 + `profile/*.ts` (~1450) | 🔴 Élevée | plusieurs sous-modules (rendering, saving, modals, state) |
| `result.ts` (tests-preferences/result.php) | 75 | 923 | 🔴 Élevée | moteur de résultats de tests de personnalité |
| `why-teams.php`               | 237   | 483   | 🟠 Moyenne | |
| `target-list.php`             | 100   | 581   | 🟠 Moyenne | |
| `team-example.php`            | 119   | 332   | 🟠 Moyenne | |
| `basic-information.php`       | 372   | (partagé `test-form.ts`, 364) | 🟠 Moyenne | formulaire de test long |
| `my-jobs.php`                 | 204   | 221   | 🟡 Faible-moyenne | |
| `company_con.php`             | 64    | 199   | 🟡 Faible-moyenne | |
| `big-5.php`, `test.php`, `_personality-test-template.php` | ~420 total | (via `test-form.ts`) | 🟡 Moyenne | pages du moteur de tests |
| `microresume.php`             | 167   | 118   | 🟢 Faible | |
| `verify-email.php`            | 83    | 162   | 🟢 Faible | |
| `reset-password.php`          | 97    | 67    | 🟢 Faible | |
| `microresume-example.php`     | 170   | 28    | 🟢 Faible | |
| `forgot-password.php`         | 85    | 47    | 🟢 Faible | |
| `company-archives.php`        | 177   | 20    | 🟢 Faible | |
| `company_archive_true.php`    | 6     | –     | 🟢 Très faible | |
| `tests-preferences.php`       | 82    | 103   | 🟢 Faible | page d'entrée du moteur de tests |

**Suggestion d'ordre** : terminer les pages 🟢 (rapides, indépendantes),
puis `why-teams` / `target-list` / `team-example` / `my-jobs` (🟡🟠, logique
autonome), puis attaquer `login.php` + `auth.ts` (nécessaire pour débloquer
`profile.php`), puis `profile.php` et son sous-dossier, puis le moteur de
tests de personnalité, et terminer par `company_con_admin.php` qui est le
plus gros morceau et bénéficiera d'être découpé en composants une fois que
les patterns (formulaires, appels API, état partagé) auront été établis sur
les pages précédentes.

## Ce qui n'a pas encore d'équivalent React

- La couche `services/*.service.ts` (appels API) — à regarder pour décider
  si elle est réutilisée telle quelle (probablement oui, elle ne dépend pas
  du DOM) ou adaptée en hooks (`useUserService()`, etc.).
- Le routing ne gère pas encore l'authentification (routes protégées) —
  à ajouter une fois `login.php`/`auth.ts` migré.
- `<title>` / meta description sont gérés par `usePageMeta()` (léger,
  sans dépendance). Pour du SSR/SEO plus poussé, envisager
  `react-helmet-async` plus tard.

## Nouveau : services API (lot 3)

`organization.service.ts` et `card.service.ts` suivent le même principe que
`auth.service.ts`/`user.service.ts` — wrappers `fetch` temporaires en
attendant `@repo/models`. `card.service.ts` retourne du HTML de carte que
`OrgCard.tsx` injecte dans une `<iframe srcDoc>` sandboxée (identique à
l'original), avec le même calcul d'échelle/hauteur automatique.

`src/lib/targetListMatching.ts` contient toute la logique de scoring et de
filtrage de `target-list.ts`, portée en fonctions pures testables
indépendamment du DOM.

## Nouveau : session d'auth partagée (lot 4)

`src/lib/authSession.ts` centralise toute la logique de session portée
depuis `js/auth.ts` : normalisation du type de compte, sauvegarde/lecture
du "pending account type" (le compte n'a pas encore de rôle tant que
l'email n'est pas vérifié), sauvegarde de `bildyx_session`/`bildyx_user`,
calcul de la redirection (`/company-admin` vs `/profile`), et le rate
limiting des tentatives de connexion (5 essais / 10 min, stocké dans
`localStorage`). `Login.tsx` et `VerifyEmail.tsx` partagent ce module —
c'est le même comportement que le bundle original où `auth.ts` gérait à la
fois login/signup et la page verify-email.

**Écart connu** : `login.php` référence `images/image.jpg` (icônes
décoratives dans les champs) et `images/google.svg`, qui n'existent pas
dans le dossier `images/` du repo (déjà cassé côté PHP). Le bouton
"Afficher le mot de passe" utilise des emoji (👁/🙈) à la place de l'icône
manquante.

## Nouveau : moteur de tests de personnalité (lot 5)

`src/lib/personalityReport.ts` est un **portage quasi verbatim** de
`js/result.ts` (jusqu'à `testDetailsMap` inclus) — ce module ne touchait déjà
pas au DOM/React, c'est un générateur de PDF autonome (SVG donut chart,
word clouds dessinés à la main, rasterisation via html2canvas, assemblage
via jsPDF). Il n'y avait rien à "réécrire en React" ici : seule l'orchestration
(fetch des scores, appel du générateur, affichage du résultat) a été portée
en composant dans `ResultTest.tsx` — c'est l'équivalent de l'ancienne IIFE en
bas de `result.ts`.

**Pages PHP orphelines non migrées** : `tests-preferences/big-5.php` et
`tests-preferences/basic-information.php` sont des démos statiques
(questions Big Five codées en dur) — **aucune page du site n'y renvoie**
(vérifié par `grep`). La vraie page de test est `test.php` (dynamique, pilotée
par le backend via `?test=CODE`), déjà migrée. Je n'ai donc pas porté ces deux
fichiers ; dis-moi si tu veux que je les fasse quand même.

## Nouveau : Profile (lot 6) — simplifications assumées

`profile.php` est la plus grosse page migrée jusqu'ici (935 + 1882 lignes
réparties sur 5 fichiers). Le cœur (nom/rôle/résumé éditables, avatar,
chips langues/compétences, sections expériences/formations/certifications
en CRUD complet avec ajout/suppression/sauvegarde) est porté fidèlement en
state React. Deux simplifications assumées par rapport à l'original :

1. **Cartes "backend-slot" d'organisation/diplôme/rôle** (recherche
   d'organisation avec `modals.ts` — 800 lignes de wiring DOM pour
   l'autocomplete + affichage de mini-cartes iframe) → remplacées par de
   simples champs texte libres (nom d'entreprise, nom d'université, nom de
   diplôme). La logique de résolution "chercher ou créer côté backend"
   (`resolveOrCreateOrganization`, `resolveOrCreateDegree`, etc. dans
   `saving.ts`) n'est pas portée : ces 15 services backend n'existent de
   toute façon pas encore (`@repo/models` manquant), donc router vers eux
   n'aurait rien changé fonctionnellement pour l'instant.
2. **Auto-save au blur** (déclenché par `scheduleAutosave()` sur chaque
   frappe) → remplacé par un bouton "Save" explicite unique, plus simple à
   raisonner en React (state contrôlé). Le comportement d'origine peut être
   ajouté avec un `useEffect` + `setTimeout` sur les états si tu le veux.

`src/services/profileResources.service.ts` factorise les ~15 services CRUD
quasi identiques du repo original (user-experience, user-education,
user-certification, user-language, user-skill, degree, certification, job,
industry, subject, skill, city, country) en deux fabriques de service
(`createProfileResourceService`, `createLookupService`) au lieu de 15
fichiers dupliqués.

## Nouveau : Company Admin — Lot A (teams, membres, offices, produits)

`company_con_admin.php` (821 + 2547 lignes, 18 modales) est de loin la plus
grosse page du site. Découpage validé avec toi en 3 lots :

- **Lot A (fait)** : structure générale (logo, nom, parent company), section
  "Our Teams" complète — tabs d'équipes (créer/supprimer avec confirmation),
  membres (ajouter/éditer/supprimer, étoile "team leader"), offices (villes),
  produits/marques, panneau "Team Profile" (people/operate, édition inline).
- **Lot B (fait)** : Portfolio (résumé des produits), Photos (upload local,
  max 10 par équipe), Partners, Customers, Investors, Subsidiaries (cartes
  simplifiées nom + suppression).
- **Lot C (à venir)** : modale Logo/Parent company avancée (recherche réelle
  au lieu d'un champ texte), confirmation de suppression stylée, finitions.

**Changement d'architecture assumé** : plutôt que d'appeler ~10 services
backend supplémentaires (`team.service`, `team-member.service`,
`team-office.service`, etc.) qui n'ont de toute façon aucun backend
fonctionnel derrière (mêmes limites que partout ailleurs dans cette
migration), l'admin **écrit directement dans le `localStorage`**
(`bildyx_company_con_profile_v3`) via `src/lib/companyProfile.ts` — exactement
la clé que `/company-con` (déjà migré) lit. Résultat concret : ce que tu
remplis dans `/company-admin` s'affiche **immédiatement** dans `/company-con`,
sans backend. C'est un vrai gain par rapport à l'original où les deux pages
étaient connectées via une vraie base de données absente ici.

Simplifications : upload logo/photo membre/photo d'équipe → stockés en data
URL locale (pas d'upload Supabase réel, cohérent avec `Profile.tsx`) ;
sélection de ville/organisation via recherche autocomplete → champ texte
libre (les services `city.service`, `organization.service` réels n'existent
pas encore) ; Partners/Customers/Investors/Subsidiaries → cartes résumé nom
uniquement au lieu des vraies cartes iframe d'organisation (même raison).

## Prochaine étape

Lot C de `company_con_admin.php` : finitions (modale logo/parent company,
confirmation de suppression stylée). C'est le dernier lot de la migration
complète du site.

## Nouveau : connexion au VRAI backend (apps/api)

Il s'avère que `apps/api` contient un backend Prisma + oRPC **complet et
fonctionnel**, avec une vraie base Postgres déjà configurée (Supabase). Tous
les services (`auth.service.ts`, `profileResources.service.ts`,
`personality.service.ts`, `organization.service.ts`, `card.service.ts`)
pointent maintenant vers les **vrais chemins REST** exposés par l'API
(`apps/api/src/routes/*.ts`, préfixe `/api`), au lieu de chemins inventés.

### Lancer l'API en local

```powershell
cd apps/api
npm install
npm run db:generate   # génère le client Prisma
npm run dev            # démarre le serveur sur http://localhost:3000
```

Le `.env` doit contenir `DATABASE_URL`/`DIRECT_URL` (voir `.env.example` —
déjà rempli avec les identifiants Supabase partagés du projet). Une fois
l'API lancée, retourne sur `apps/website-react` (`npm run dev`) : les pages
`login`, `profile`, `tests-preferences` parlent maintenant à cette vraie API.

### Ce qui reste approximatif

- Les champs `countries_worked_in`, `countries_studied_in`, `companies`,
  `products`, `job_occupations`, `degrees`, `certifications_meta` affichés
  dans `/profile` ne sont **pas** renvoyés par `GET /users/{userId}/full-profile`
  — ce sont des champs agrégés que j'avais imaginés avant de voir la vraie
  API. Ils s'afficheront vides ("—") tant qu'un vrai calcul côté backend (ou
  côté front à partir de `experiences`/`educations`) n'est pas ajouté.
- Les champs "libres" (nom d'entreprise, université, diplôme... dans
  `Profile.tsx`/`CompanyAdmin.tsx`) restent du texte simple : la vraie API a
  des tables `organizations`/`degrees`/`certifications` avec recherche, mais
  brancher un vrai autocomplete est un chantier à part.
- `company_con_admin` (teams, membres, etc.) utilise toujours le
  `localStorage` plutôt que les vraies routes `/teams`, `/team-members`,
  etc. — un branchement futur possible si tu veux aller plus loin.
