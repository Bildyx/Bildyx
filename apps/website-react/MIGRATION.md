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

Toutes les autres pages ont une route **placeholder** (`NotYetMigrated`) pour
que la navigation ne casse jamais pendant la migration.

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

## Prochaine étape

Dis-moi quel lot tu veux ensuite — je recommande de commencer par les pages
🟢 (`microresume-example`, `forgot-password`, `verify-email`,
`reset-password`, `company-archives`, `microresume`) en un seul lot, vu
qu'elles sont indépendantes et rapides à porter.
