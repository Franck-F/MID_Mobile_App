export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PAYMENT_PROVIDERS = ['orange_momo', 'mtn_momo', 'card'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
