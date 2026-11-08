# Family Devotion

A simple website for families who want to pray according to God’s will. It is a small library of prayers, including the prayers of the Apostle Paul, and Bible verses gathered by topic.

The sample Scripture is from the World English Bible, which is in the public domain.

Each deployment gets its own database. The sample prayers and verses are a shared starting point, not one family’s private notes. The first time the site opens, it creates the tables and adds those samples.

## Deploy with Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyannhowe%2Ffamily-devotion&project-name=family-devotion&repository-name=family-devotion&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22tursocloud%22%2C%22productSlug%22%3A%22database%22%2C%22protocol%22%3A%22storage%22%7D%5D)

1. Click **Deploy with Vercel**.
2. Sign in. Vercel clones this repository into your own Git account and creates a new project.
3. When asked, create a Turso database. Vercel connects that database to the project and sets `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for you.
4. Deploy, then open the site. The first visit fills the new database with the sample prayers and verses.

You get your own copy of the site and your own database. Additions you make later stay in that database.

Vercel’s Hobby plan is for personal, non-commercial use. If this site is for a church, ministry, or other organization, read [Vercel’s plan terms](https://vercel.com/docs/plans) before you choose a plan.

### Environment variables

You do not need to set anything for a normal Vercel deploy. The button’s Turso step sets the database variables.

| Name | When you need it |
| --- | --- |
| `TURSO_DATABASE_URL` | Set by the Turso integration. The libSQL address of this project’s database. |
| `TURSO_AUTH_TOKEN` | Set by the Turso integration. The token that lets the site open that database. |
| `DATABASE_URL` | Optional. Use this instead of `TURSO_DATABASE_URL` if you already have a libSQL URL, for example `libsql://your-database.turso.io`. If both are set, `DATABASE_URL` is the one that is used. |
| `ADMIN_PASSWORD` | Optional. If you set it, the page **Care for this library** (`/admin`) can add a prayer or a verse. If you leave it empty, the site is read-only. This is one shared password, not user accounts. |
| `VESTABOARD_READ_WRITE_KEY` | Optional and unused. Kept for a possible later connection to a Vestaboard. |

To allow additions after deploy, add `ADMIN_PASSWORD` in the Vercel project’s environment variables and redeploy.

## Docker Compose

Use this when you want the site on a computer you control.

1. Install [Docker](https://docs.docker.com/get-docker/).
2. In this folder, run:

```bash
docker compose up --build
```

3. Open [http://localhost:3000](http://localhost:3000).

The prayers and verses are stored in a SQLite file on a Docker volume named `devotion-data`. No other service is required.

To allow additions, create a file named `.env` next to `docker-compose.yml`:

```bash
ADMIN_PASSWORD=choose-a-password
```

Run `docker compose up --build` again, then open `/admin`. `.env.example` lists every optional setting.

## What you can do

- Read the prayers of Paul from **Prayers of Paul**.
- Browse every prayer, and open one to read it in full.
- Browse verses by topic: Prayer, Love, Wisdom, and Thanksgiving.
- Search from the box at the top of the page.
- Add a prayer or a verse at `/admin` when `ADMIN_PASSWORD` is set.
