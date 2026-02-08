## TanstackFaster

A highly performant e-commerce template rebuilt with TanStack Start, based on the original [NextFaster](https://github.com/ethanniser/NextFaster) by [@ethanniser](https://x.com/ethanniser), [@RhysSullivan](https://x.com/RhysSullivan) and [@armans-code](https://x.com/ksw_arman).

This project demonstrates the capabilities of TanStack Start including server-side rendering and Server functions.

### Design notes

**Check out the detailed [twitter thread](https://x.com/ethanniser/status/1848442738204643330) for the original NextFaster**

- Uses [TanStack Start](https://tanstack.com/start)
  - Server-side rendering
  - Tanstack's Server Functions
  - File-based routing
- Uses [Drizzle ORM](https://orm.drizzle.team/docs/overview) on top of [Neon Postgres](https://neon.tech)
- Images stored on [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (from the original project)

### Deployment

- Make sure the Vercel project is connected to a Vercel Postgres (Neon) database and Vercel Blob Storage
- Run `pnpm db:push` to apply schema to your db
- Run `pnpm build` to build the production bundle

### Local dev

- Run `vc link` to link your project to Vercel.
- Run `vc env pull` to get a `.env.local` file with your db credentials.
- Run `pnpm install` && `pnpm dev` to start developing.
- The data/data.zip includes a ~300 MB data.sql file with the full schema and 1,000,000+ products (_Note, the data exceeds the size limit allowed by the free tier for Neon_ [see more](https://neon.com/pricing)). To seed Vercel Postgres with this data:
  - Unzip data.zip to data.sql.
  - Run `psql "YOUR_CONNECTION_STRING" -f data/data.sql`.
- Create the default roles in your database.
  - Run `psql "YOUR_CONNECTION_STRING"`
  - Now run CREATE ROLE default; and CREATE ROLE cloud_admin;
- For DB migrations with `drizzle-kit`:
  - Make sure `?sslmode=required` is added to the `POSTGRES_URL` env for dev
  - Run `pnpm db:push` to apply schema to your db

### Performance

[PageSpeed Report](https://pagespeed.web.dev/analysis/https-tanstack-faster-vercel-app/r6a6yq9c6n?form_factor=desktop)

<img width="593" height="308" alt="speedreport" src="https://github.com/user-attachments/assets/3579afa0-44ff-4c5d-94b6-8409897b8573" />

### Costs

The TanstackFaster project is currently running on the **Vercel free tier** with negligible Neon DB costs.
