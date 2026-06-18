export const PAYMENT_PLANS = [
  {
    id: "premium",
    displayNameKey: "payment.planPremiumName",
    descriptionKey: "payment.planPremiumDesc",
    amount: 299000,
    originalAmount: 399000,
    cycleLabelKey: "payment.planPremiumCycle",
    badgeKey: "payment.planPremiumBadge",
    discountLabelKey: "payment.planPremiumDiscount",
    icon: "sparkles-outline",
    featured: true,
    featuresKeys: [
      "payment.planPremiumFeature1",
      "payment.planPremiumFeature2",
      "payment.planPremiumFeature3",
      "payment.planPremiumFeature4"
    ]
  },
  {
    id: "basic",
    displayNameKey: "payment.planBasicName",
    descriptionKey: "payment.planBasicDesc",
    amount: 2000,
    cycleLabelKey: "payment.planBasicCycle",
    badgeKey: "payment.planBasicBadge",
    icon: "shield-checkmark-outline",
    featuresKeys: [
      "payment.planBasicFeature1",
      "payment.planBasicFeature2",
      "payment.planBasicFeature3",
      "payment.planBasicFeature4"
    ]
  }
];
