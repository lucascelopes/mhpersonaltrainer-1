type PaymentStatusFields = {
  Pago?: boolean;
  pago?: boolean;
  stripeStatus?: string | null;
  status?: string | null;
};

const PAID_STATUSES = new Set(['paid', 'pago', 'succeeded']);

export function isPaymentPaid(payment: PaymentStatusFields): boolean {
  const statuses = [payment.stripeStatus, payment.status]
    .map((value) => String(value ?? '').trim().toLowerCase());

  return payment.Pago === true || payment.pago === true || statuses.some((status) => PAID_STATUSES.has(status));
}
