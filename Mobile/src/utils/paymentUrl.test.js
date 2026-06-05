const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

async function loadPaymentUrlModule() {
  const source = fs.readFileSync(path.join(__dirname, "paymentUrl.js"), "utf8");
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
  return import(moduleUrl);
}

test("isPaymentResultUrl recognizes PayOS cancel callback params", async () => {
  const { buildPaymentResultParams, isPaymentResultUrl } = await loadPaymentUrlModule();
  const url = "https://pay.payos.vn/web/order?code=00&id=pay_123&cancel=true&status=CANCELLED&orderCode=456";

  assert.equal(isPaymentResultUrl(url), true);
  assert.deepEqual(buildPaymentResultParams(url), {
    result: "cancel",
    orderCode: "456",
    status: "CANCELLED",
    id: "pay_123"
  });
});

test("isPaymentResultUrl recognizes PayOS paid callback params", async () => {
  const { buildPaymentResultParams, isPaymentResultUrl } = await loadPaymentUrlModule();
  const url = "https://pay.payos.vn/web/order?code=00&id=pay_456&cancel=false&status=PAID&orderCode=789";

  assert.equal(isPaymentResultUrl(url), true);
  assert.deepEqual(buildPaymentResultParams(url), {
    result: "success",
    orderCode: "789",
    status: "PAID",
    id: "pay_456"
  });
});

test("isPaymentResultUrl recognizes cancel path without callback params", async () => {
  const { buildPaymentResultParams, isPaymentResultUrl } = await loadPaymentUrlModule();
  const url = "https://pay.payos.vn/web/order/pay_123/cancel";

  assert.equal(isPaymentResultUrl(url), true);
  assert.deepEqual(buildPaymentResultParams(url, "456"), {
    result: "cancel",
    orderCode: "456",
    status: "",
    id: ""
  });
});

test("isPaymentResultUrl recognizes success path without callback params", async () => {
  const { buildPaymentResultParams, isPaymentResultUrl } = await loadPaymentUrlModule();
  const url = "https://pay.payos.vn/web/order/pay_123/success";

  assert.equal(isPaymentResultUrl(url), true);
  assert.deepEqual(buildPaymentResultParams(url, "789"), {
    result: "success",
    orderCode: "789",
    status: "",
    id: ""
  });
});

test("isPaymentResultUrl ignores generic status params without payment identity", async () => {
  const { isPaymentResultUrl } = await loadPaymentUrlModule();

  assert.equal(isPaymentResultUrl("https://example.com/profile?status=PAID"), false);
});
