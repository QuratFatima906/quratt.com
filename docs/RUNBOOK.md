# Runbook

Operational procedures for `quratt.com`. Every command here has been run against this project,
not copied from documentation.

| | |
|---|---|
| Vercel project | `quratt-com` (`prj_YNyJNwEuTa77vUg22TE8XYLUniZr`), team `quratfatima906s-projects` |
| Repository | `QuratFatima906/quratt.com`, production tracks `main` |
| Database | Neon, resource `neon-amber-mountain`, provisioned through the Vercel Marketplace |
| Domain | `quratt.com`, registered at GoDaddy, nameservers delegated to Vercel |

The CLI needs no `--token` on a machine where `vercel login` has been run; `npx vercel whoami`
confirms it. All commands run from the repository root, which holds `.vercel/project.json`.

---

## Deploy

Normal path: **merge to `main`.** Vercel's Git integration builds and promotes it. A pull
request gets its own preview URL and its own Neon database branch, so a preview can never write
to production data.

Out-of-band, from a working tree:

```bash
vercel deploy            # preview
vercel deploy --prod     # production
```

Watch it, then confirm what actually went live:

```bash
vercel ls                                   # recent deployments and their targets
vercel inspect <deployment-url>             # build detail, functions, duration
curl -sS -o /dev/null -w '%{http_code}\n' https://quratt.com/
```

A production deploy that builds is not yet a production deploy that works. The build only proves
the pages prerendered — it says nothing about the database being reachable at request time or the
domain resolving. Check the URL.

### If the build fails

`vercel logs <deployment-url>` for the build output. The two failures this project can actually
produce:

- **`DATABASE_URL` missing or unreachable.** Every content page is prerendered, so the build
  reads the database. Check `vercel env ls` still lists `DATABASE_URL` for the target
  environment; if Neon is suspended, the first connection wakes it and the build simply takes
  longer.
- **Lockfile drift.** `ERR_PNPM_OUTDATED_LOCKFILE` means `package.json` changed without
  `pnpm install`. Run it, commit `pnpm-lock.yaml`.

---

## Roll back

Production aliases are re-pointed, not rebuilt, so a rollback is seconds and cannot fail on a
build error.

```bash
vercel rollback <url-or-id>      # to a specific one — the form that actually works
vercel alias ls                  # confirm which deployment now holds production
```

Use the explicit `<url-or-id>` form. Bare `vercel rollback` prints "No deployment rollback in
progress" and exits without moving anything (observed during the P8 drill, 2026-08-18); the
explicit form re-points the production aliases in **2 s** (6 s including the CLI's deployment
lookup). `vercel alias ls` shows the live assignment — `source` is the deployment, and the rows
carrying `quratt.com` / `www.quratt.com` are what production serves.

Confirm on the site, not just in the CLI. A success line means the API accepted the change; it
does not prove the edge is serving the older build. Fingerprint what is actually served:

```bash
curl -s https://quratt.com/ | grep -oE 'chunks/[a-z0-9_-]+\.js' | sort -u | shasum
```

Run it before and after — the hash must change. Drilled 2026-08-18 and 2026-08-19.

Roll back first, diagnose second. The previous deployment is known-good; the broken one is still
in `vercel ls` with its logs intact, and nothing about rolling back destroys it.

**What a rollback does not undo:** database migrations. Code reverts, schema does not. If the bad
deploy ran a destructive migration, the rollback leaves old code against a new schema — see
*Restore the database*. This is why migrations here are additive by default.

To go forward again after a fix, deploy normally, or `vercel promote <url>`.

**`promote` does not always re-point — it can rebuild.** Promoting a *preview* deployment
rebuilds it, measured at 26 s here, because preview and production builds genuinely differ:
`NEXT_PUBLIC_SITE_URL` changes and Analytics is gated on `VERCEL_ENV`. It is an instant alias
move only when the target was already built for production — which is always true of a rollback
target, and is why rollback is the fast direction.

---

## Rotate a secret

Nothing secret is committed; `.env.local` is gitignored and is only ever a copy.

```bash
vercel env rm <NAME> production          # remove the old value
vercel env add <NAME> production         # paste the new one when prompted
vercel deploy --prod                     # env vars are read at build time — a redeploy is required
vercel env pull .env.local               # resync this machine
```

The redeploy is not optional. `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL` are both consumed while
prerendering, so a rotated value that is never rebuilt against is a value that is not yet live.

For the database credentials specifically, rotate on the **Neon** side (Neon console → the
project → Roles → reset password). The Vercel integration writes the new connection string back
into the project's environment variables itself; do not hand-edit `DATABASE_URL` afterwards or
the next integration sync will overwrite you.

---

## Restore the database

Neon keeps a continuous history, so recovery is a branch from a timestamp rather than a file
restore.

1. Neon console → the project → **Branches** → *Restore*, or create a branch from a point in
   time before the damage.
2. Verify the data on that branch with a direct connection string before touching production.
3. Point production at it: either promote the restored branch to primary in Neon, or replace
   `DATABASE_URL` in Vercel per *Rotate a secret* above.
4. Redeploy. Content is prerendered, so the site keeps serving the **old** pages until a build
   or a cache-tag invalidation runs — restoring the database alone changes nothing a visitor sees.

Rebuilding from seed is the other option, and for this site it is often the right one: content
lives in `src/content/seed.ts` and `src/content/posts/*.mdx` in git.

```bash
pnpm db:migrate && pnpm db:seed     # against whichever DATABASE_URL is in .env.local
```

`db:seed` is an idempotent upsert on stable row ids — safe to re-run, will not duplicate rows,
and leaves `updated_at` alone on rows whose content has not changed.

---

## Publish a content change

Editing `src/content/seed.ts` changes nothing on its own. The windows read Postgres; the seed
file is only the seeder's input. Merging the commit is not enough either — a build reads
whatever is in the database at the moment it runs, so deploying without seeding prerenders the
old copy with a new bundle.

```bash
pnpm db:seed        # then redeploy, or invalidate the collection's cache tag
```

Order matters: **seed first, deploy second.** The reverse builds against stale rows and looks
like the seed silently failed. `cacheLife('max')` means a prerendered page otherwise sits
there indefinitely.

> ### ⚠️ Local development shares production's database
>
> As of 2026-08-19, `DATABASE_URL` in `.env.local` is the production one — same Neon host,
> database and credentials.
>
> Prove it the strong way, not the weak one. Comparing `vercel env pull` output is **not**
> sufficient: Neon injects branch credentials by webhook at deploy time and never stores them
> in project settings, so that command returns the shared value whether or not branching is
> on — the trap this phase already fell into twice (`progress.md`). Evidence that actually
> distinguishes the two cases is a row:
>
> ```bash
> pnpm db:seed                                    # writes via .env.local
> # then read the same row back through the production connection string.
> # If the edit is there, they are one database.
> ```
>
> Two consequences while this is true:
>
> - `pnpm db:seed` on a laptop writes to the live site. There is no local copy to rehearse
>   against, and no undo.
> - The upside is that the step above is the whole procedure. There is no separate production
>   seed to remember, which is exactly why it is easy not to notice.
>
> Preview deployments *are* isolated — each gets its own Neon branch (`ENVIRONMENT.md`). It is
> only local development that is not. Giving local its own branch is the fix; until then,
> treat every `db:seed` as a production write.

---

## DNS

`quratt.com` is registered at GoDaddy with nameservers delegated to `ns1.vercel-dns.com` /
`ns2.vercel-dns.com`. Vercel therefore serves the entire zone: any record ever needed on this
domain — mail included — is created in Vercel, not GoDaddy.

```bash
vercel domains inspect quratt.com     # intended vs current nameservers, verification state
dig +short quratt.com NS
```

The pre-delegation zone is recorded in `docs/dns-snapshot.md`, along with how to undo the
delegation. There was nothing in it: no MX, no TXT, no subdomains.
