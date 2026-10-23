'use client';

import { useMemo } from 'react';
import PageShell from '@/components/PageShell';
import UserScopePicker from '@/components/data/UserScopePicker';
import { formatDate, useCollectionData, useUserScope } from '@/lib/firestoreHooks';
import { formatCurrency } from '@/lib/services/payments';
import type { PaymentRecord } from '@/lib/types/finance';
import { isPaymentPaid } from '@/lib/paymentStatus';
import { isValidPaymentLink } from '@/lib/paymentLink';
import styles from './page.module.css';

interface PaymentRow {
  id: string;
  valorDaCombranca?: number;
  valor?: number;
  todoDiaDoMes?: number;
  descricao?: string;
  pago?: boolean;
  Pago?: boolean;
  repetirPMes?: number;
  diaDoPagamento?: number;
  datas?: any[];
  checkoutUrl?: string;
  checkout_url?: string;
  stripeStatus?: string;
  status?: string;
  createdAt?: any;
  data?: any;
}

const normalizePayment = (row: PaymentRow): PaymentRecord => {
  const dates = Array.isArray(row.datas)
    ? row.datas
        .map((item) => (item?.toDate ? item.toDate() : item ? new Date(item) : null))
        .filter(Boolean)
    : [];

  return {
    id: row.id,
    valorDaCombranca: row.valorDaCombranca ?? row.valor ?? 0,
    todoDiaDoMes: row.todoDiaDoMes ?? row.diaDoPagamento ?? undefined,
    descricao: row.descricao ?? 'Cobranca',
    pago: isPaymentPaid(row),
    repetirPMes: row.repetirPMes,
    diaDoPagamento: row.diaDoPagamento,
    datas: dates as Date[],
    checkoutUrl: row.checkoutUrl ?? row.checkout_url,
    stripeStatus: row.stripeStatus ?? row.status,
  };
};

export default function FinanceiroAlunoPage() {
  const { userId } = useUserScope();
  const { data } = useCollectionData<PaymentRow>(['users', userId, 'pagamentos']);

  const payments = useMemo(() => data.map(normalizePayment), [data]);
  const orderedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const timeA = a.datas?.[0]?.getTime?.() || 0;
      const timeB = b.datas?.[0]?.getTime?.() || 0;
      return timeB - timeA;
    });
  }, [payments]);

  const totalPendente = useMemo(() => {
    return payments.filter((item) => !item.pago).reduce((sum, item) => sum + (item.valorDaCombranca || 0), 0);
  }, [payments]);

  const proximoVencimento = useMemo(() => {
    const dias = payments
      .filter((item) => !item.pago && item.todoDiaDoMes)
      .map((item) => item.todoDiaDoMes as number)
      .sort((a, b) => a - b);
    return dias.length ? dias[0] : null;
  }, [payments]);

  const handleOpenPayment = (url?: string) => {
    if (!url || !isValidPaymentLink(url) || typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <PageShell
      title="Financeiro do aluno"
      description="Pagamentos, faturas e status do aluno."
      breadcrumbs={[{ label: 'Painel', href: '/app' }]}
    >
      <UserScopePicker />
      <div className={`finance-aluno ${styles.page}`}>
        <div className="finance-summary-grid">
          <div className="finance-summary-card">
            <span>Total pendente</span>
            <strong>{formatCurrency(totalPendente)}</strong>
          </div>
          <div className="finance-summary-card">
            <span>Próximo vencimento</span>
            <strong>{proximoVencimento ? `Dia ${proximoVencimento}` : '-'}</strong>
          </div>
        </div>

        <div className="card finance-section">
          <div className="finance-card-header">
            <div>
              <h3>Métodos de pagamento</h3>
              <p className="subtle">Opções disponíveis para quitar cobranças.</p>
            </div>
          </div>
          <div className="finance-methods">
            <div className="finance-method-card">
              <div className="finance-method-icon">CC</div>
              <div>
                <strong>Cartão de crédito</strong>
                <p className="subtle">Em breve</p>
              </div>
            </div>
            <div className="finance-method-card">
              <div className="finance-method-icon">PIX</div>
              <div>
                <strong>Pix</strong>
                <p className="subtle">Informe ao personal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card finance-section">
          <div className="finance-card-header">
            <div>
              <h3>Cobranças</h3>
              <p className="subtle">Lista completa de pagamentos pendentes ou pagos.</p>
            </div>
          </div>
          {!userId && <p className="subtle">Informe um UID para listar pagamentos.</p>}
          {userId && orderedPayments.length === 0 && <p className="subtle">Nenhuma cobrança encontrada.</p>}
          {userId && orderedPayments.length > 0 && (
            <div className="finance-payments-grid">
              {orderedPayments.map((payment) => (
                <div key={payment.id} className={`finance-payment-card ${styles.paymentCard}`}>
                  <div className={`finance-payment-header ${styles.paymentHeader}`}>
                    <div className={`finance-payment-title ${styles.paymentTitle}`}>
                      <span className={`finance-payment-tag ${payment.pago ? 'is-paid' : 'is-pending'}`}>
                        {payment.pago ? 'Pago' : 'Pendente'}
                      </span>
                      <strong className={styles.paymentDescription}>{payment.descricao || 'Cobrança'}</strong>
                    </div>
                    <span className={`finance-payment-value ${styles.paymentValue}`}>
                      {formatCurrency(payment.valorDaCombranca || 0)}
                    </span>
                  </div>
                  <p className={`finance-payment-meta ${styles.paymentMeta}`}>
                    Vencimento {payment.todoDiaDoMes ? `dia ${payment.todoDiaDoMes}` : '-'}
                  </p>
                  {payment.datas?.[0] && (
                    <p className={`finance-payment-meta ${styles.paymentMeta}`}>Registrado em {formatDate(payment.datas[0])}</p>
                  )}
                  {payment.stripeStatus && (
                    <p className={`finance-payment-meta ${styles.paymentMeta}`}>Stripe: {payment.stripeStatus}</p>
                  )}
                  {!payment.pago && (
                    <div className={`finance-payment-actions ${styles.paymentActions}`}>
                      {isValidPaymentLink(payment.checkoutUrl) ? (
                        <button
                          type="button"
                          className={`button secondary sm ${styles.paymentButton}`}
                          onClick={() => handleOpenPayment(payment.checkoutUrl)}
                        >
                          Abrir link de pagamento
                        </button>
                      ) : (
                        <span className={`finance-payment-hint ${styles.paymentHint}`}>
                          {payment.checkoutUrl ? 'Peça um link de pagamento válido ao personal' : 'Aguardando link do personal'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
