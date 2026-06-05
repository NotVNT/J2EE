const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

async function loadPaymentStatusModule() {
  const source = fs.readFileSync(path.join(__dirname, "paymentStatus.js"), "utf8");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(moduleUrl);
}

test("getPaymentStatusMeta maps paid status to success label", async () => {
  const { getPaymentStatusMeta } = await loadPaymentStatusModule();

  assert.deepEqual(getPaymentStatusMeta("paid"), {
    label: "Đã thanh toán",
    tone: "success",
    icon: "checkmark-circle-outline"
  });
});

test("canSyncPaymentStatus disables sync for paid payments only", async () => {
  const { canSyncPaymentStatus } = await loadPaymentStatusModule();

  assert.equal(canSyncPaymentStatus("PAID"), false);
  assert.equal(canSyncPaymentStatus("PENDING"), true);
  assert.equal(canSyncPaymentStatus("CANCELLED"), true);
});
