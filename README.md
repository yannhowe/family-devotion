# Family Devotion

A simple website for families who want to pray according to God’s will. It is a small library of prayers, including the prayers of the Apostle Paul, and Bible verses gathered by topic.

The sample Scripture stored with the app is from the World English Bible, which is in the public domain. If you add an ESV API key, the site shows the English Standard Version for those same passages instead.

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
| `ESV_API_KEY` | Optional. A token from [api.esv.org](https://api.esv.org/). When it is set, Scripture on the site is loaded from the English Standard Version. When it is empty, the site keeps the World English Bible samples. Crossway’s free API is for non-commercial personal, church, and ministry use. |
| `VESTABOARD_READ_WRITE_KEY` | Optional and unused. Kept for a possible later connection to a Vestaboard. |

To allow additions after deploy, add `ADMIN_PASSWORD` in the Vercel project’s environment variables and redeploy. To show the ESV, add `ESV_API_KEY` the same way. The site caches those passages on your database, stays within Crossway’s limit of 500 verses and half of any book, and refreshes the cache about every two weeks. If the ESV cannot be loaded, the page shows the World English Bible instead.

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
- Read one Vestaboard-ready verse from `GET /api/vestaboard`.

## Vestaboard

`GET /api/vestaboard` returns one verse that is tagged Vestaboard. No Vestaboard key is required. A board or script can POST `text` or `characters` unchanged to Vestaboard’s write API.

- No query: a random verse tagged Vestaboard.
- `?topic=thanksgiving`: a random Vestaboard verse that also has that topic.
- `?reference=Psalm%20107:1`: that verse, if it is tagged Vestaboard.
- `?size=note`: a 3 by 15 Note layout. The default is the flagship board, 6 rows by 22 columns.

Until a verse is tagged Vestaboard, the response is `404` with `{ "error": "No verses are tagged for the Vestaboard." }`. If the short version is saved, that excerpt is the board text and `vestaboard_reference` is the citation when it is set. If the short version is empty, the response fits an excerpt of the passage. When an ESV key is set and no short version is saved, the board text is an excerpt of the ESV and includes `ESV`.

```json
{
  "reference": "Psalm 107:1",
  "translation": "WEB",
  "topics": ["thanksgiving", "vestaboard"],
  "text": "PS 107:1\nGIVE THANKS TO YAHWEH,\nFOR HE IS GOOD, FOR HIS\nLOVING KINDNESS\nENDURES FOREVER.",
  "characters": [
    [16, 19, 0, 27, 36, 33, 50, 27, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
}
```

`characters` is six rows of 22 Vestaboard character codes. The sample above shows only the first row.
