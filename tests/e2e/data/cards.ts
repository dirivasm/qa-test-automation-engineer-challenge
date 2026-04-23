/**
 * Payment card fixtures. These are NOT real card numbers — the
 * automationexercise.com payment form is a sandbox that accepts any value.
 * Kept in a single place so specs can refer to them by intent.
 */

export interface Card {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export const FAKE_CARD: Card = {
  nameOnCard: 'NanLabs QA',
  cardNumber: '4242 4242 4242 4242',
  cvc: '311',
  expiryMonth: '12',
  expiryYear: '2030',
};

export const INVALID_EXPIRY_MONTH: Card = {
  ...FAKE_CARD,
  expiryMonth: '13',
};

export const NON_NUMERIC_CARD: Card = {
  ...FAKE_CARD,
  cardNumber: 'abcd efgh ijkl mnop',
};

export const EMPTY_CARD: Card = {
  nameOnCard: '',
  cardNumber: '',
  cvc: '',
  expiryMonth: '',
  expiryYear: '',
};
