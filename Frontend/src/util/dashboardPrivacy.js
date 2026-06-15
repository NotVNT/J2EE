export const PRIVATE_MONEY_PLACEHOLDER = "******";

export const maskMoneyText = (value, isVisible) => (
  isVisible ? value : PRIVATE_MONEY_PLACEHOLDER
);
