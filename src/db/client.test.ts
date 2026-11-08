import assert from "node:assert/strict";
import test from "node:test";
import { resolveDatabaseConfig } from "./client";
import { DatabaseConfigError } from "./errors";

const remoteUrl = "libsql://example.turso.io";
const plainToken = "plain-token";

test("TURSO_AUTH_TOKEN unwraps to the token sent to a remote database", () => {
  const previous = {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    VERCEL: process.env.VERCEL,
  };

  const restore = () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };

  try {
    delete process.env.DATABASE_URL;
    delete process.env.VERCEL;
    process.env.TURSO_DATABASE_URL = remoteUrl;

    process.env.TURSO_AUTH_TOKEN = plainToken;
    assert.deepEqual(resolveDatabaseConfig(), { url: remoteUrl, authToken: plainToken });

    process.env.TURSO_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiJ9.payload.signature";
    assert.equal(
      resolveDatabaseConfig().authToken,
      "eyJhbGciOiJIUzI1NiJ9.payload.signature",
    );

    process.env.TURSO_AUTH_TOKEN = `b64:${Buffer.from(plainToken, "utf8").toString("base64")}`;
    assert.equal(resolveDatabaseConfig().authToken, plainToken);

    process.env.TURSO_AUTH_TOKEN = "sep:p,l,a,i,n,-,t,o,k,e,n";
    assert.equal(resolveDatabaseConfig().authToken, plainToken);

    process.env.TURSO_AUTH_TOKEN = "a,b,c";
    assert.equal(resolveDatabaseConfig().authToken, "a,b,c");

    for (const empty of [undefined, "", "   ", "sep:,,,"]) {
      if (empty === undefined) delete process.env.TURSO_AUTH_TOKEN;
      else process.env.TURSO_AUTH_TOKEN = empty;
      assert.throws(() => resolveDatabaseConfig(), DatabaseConfigError);
    }

    process.env.DATABASE_URL = "libsql://chosen.turso.io";
    process.env.TURSO_DATABASE_URL = remoteUrl;
    process.env.TURSO_AUTH_TOKEN = plainToken;
    assert.equal(resolveDatabaseConfig().url, "libsql://chosen.turso.io");

    process.env.DATABASE_URL = "file:./data/devotion.db";
    process.env.TURSO_AUTH_TOKEN = plainToken;
    assert.deepEqual(resolveDatabaseConfig(), {
      url: "file:./data/devotion.db",
      authToken: undefined,
    });
  } finally {
    restore();
  }
});
