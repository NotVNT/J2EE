# Subscription Plans And Limits

The project currently supports 3 subscription levels:

- `FREE`
- `BASIC`
- `PREMIUM`

## Plan Rules

### `FREE`
- Maximum `10` categories per account
- Maximum `100` income/expense transactions per month
- Transaction filtering is limited to the last `3 months`
- Excel export is not allowed
- Emailing Excel reports is not allowed

### `BASIC`
- Maximum `30` categories per account
- Maximum `1000` income/expense transactions per month
- Transaction filtering is limited to the last `12 months`
- Excel export is allowed
- Emailing Excel reports is allowed

### `PREMIUM`
- Unlimited categories
- Unlimited monthly transactions
- Unlimited transaction history filtering
- Excel export is allowed
- Emailing Excel reports is allowed

## Current Backend Enforcement

The backend now applies plan restrictions in these areas:

- Creating categories
- Creating incomes
- Creating expenses
- Filtering transactions
- Downloading Excel reports
- Emailing Excel reports

## Subscription Activation Logic

- New users start with plan `FREE`
- When a PayOS payment is confirmed as `PAID`, the backend activates the purchased plan
- Supported paid plans:
  - `basic` -> `BASIC`
  - `premium` -> `PREMIUM`

## Subscription State Stored On Profile

Each profile now stores:

- `subscriptionPlan`
- `subscriptionStatus`
- `subscriptionActivatedAt`
- `subscriptionExpiresAt`
- `autoRenew`

## Notes

- `FREE` is intended for product trial and basic personal usage
- `BASIC` is for regular users who need exports and longer history
- `PREMIUM` is for advanced users who want no practical limits
