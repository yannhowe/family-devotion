import assert from "node:assert/strict";
import test from "node:test";
import {
  adminSessionToken,
  getAdminPassword,
  passwordsMatch,
  sessionMatches,
} from "./password";

test("ADMIN_PASSWORD unwraps to the password a person types", () => {
  const previous = process.env.ADMIN_PASSWORD;
  const password = "family-password";

  try {
    process.env.ADMIN_PASSWORD = password;
    assert.equal(getAdminPassword(), password);
    assert.equal(passwordsMatch(password, getAdminPassword() ?? ""), true);

    process.env.ADMIN_PASSWORD = `b64:${Buffer.from(password, "utf8").toString("base64")}`;
    assert.equal(getAdminPassword(), password);

    process.env.ADMIN_PASSWORD = "sep:f,a,m,i,l,y,-,p,a,s,s,w,o,r,d";
    assert.equal(getAdminPassword(), password);

    process.env.ADMIN_PASSWORD = "a,b,c";
    assert.equal(getAdminPassword(), "a,b,c");

    delete process.env.ADMIN_PASSWORD;
    assert.equal(getAdminPassword(), undefined);

    process.env.ADMIN_PASSWORD = "   ";
    assert.equal(getAdminPassword(), undefined);

    process.env.ADMIN_PASSWORD = "";
    assert.equal(getAdminPassword(), undefined);

    process.env.ADMIN_PASSWORD = "sep:p,a,s,s";
    const decoded = getAdminPassword();
    assert.equal(decoded, "pass");
    assert.equal(passwordsMatch("pass", decoded ?? ""), true);
    assert.equal(passwordsMatch("sep:p,a,s,s", decoded ?? ""), false);
    const token = adminSessionToken(decoded ?? "");
    assert.equal(token, adminSessionToken("pass"));
    assert.equal(sessionMatches(token, decoded ?? ""), true);
    assert.equal(sessionMatches(adminSessionToken("sep:p,a,s,s"), decoded ?? ""), false);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous;
  }
});
