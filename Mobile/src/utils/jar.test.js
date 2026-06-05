const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

async function loadJarModule() {
  const source = fs.readFileSync(path.join(__dirname, "jar.js"), "utf8");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(moduleUrl);
}

test("getJarBalanceAmount uses backend currentBalance for jar balances", async () => {
  const { getJarBalanceAmount } = await loadJarModule();

  assert.equal(getJarBalanceAmount({ currentBalance: 2750000, balance: 0 }), 2750000);
});

test("getJarBalanceAmount falls back to zero when no balance is present", async () => {
  const { getJarBalanceAmount } = await loadJarModule();

  assert.equal(getJarBalanceAmount({ name: "Thiet yeu" }), 0);
});
