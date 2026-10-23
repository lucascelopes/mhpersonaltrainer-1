'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import UserScopePicker from '@/components/data/UserScopePicker';
import { formatDate, useCollectionData, useUserScope } from '@/lib/firestoreHooks';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/services/payments';
import type { PaymentRecord } from '@/lib/types/finance';
import { isPaymentPaid } from '@/lib/paymentStatus';

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

export default function FinanceiroPage() {
  const { userId } = useUserScope();
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data } = useCollectionData<PaymentRow>(['users', userId, 'pagamentos']);

  useEffect(() => {
    if (authLoading) return;
    if (role === 'aluno') router.replace('/financeiro/aluno');
    if (role === 'academy') router.replace('/academy/billing');
    if (role === 'personal' || role === 'professor') router.replace('/financeiro/personal');
  }, [authLoading, role, router]);

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

  const totalRecebido = useMemo(() => {
    return payments.filter((item) => item.pago).reduce((sum, item) => sum + (item.valorDaCombranca || 0), 0);
  }, [payments]);

  const proximoVencimento = useMemo(() => {
    const dias = payments
      .filter((item) => !item.pago && item.todoDiaDoMes)
      .map((item) => item.todoDiaDoMes as number)
      .sort((a, b) => a - b);
    return dias.length ? dias[0] : null;
  }, [payments]);

  if (authLoading || role === 'aluno' || role === 'academy' || role === 'personal' || role === 'professor') {
    return (
      <PageShell title="Financeiro">
        <p className="subtle" role="status">Abrindo o financeiro do seu perfil...</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Financeiro"
      description="Controle de faturas, assinaturas e pagamentos."
    >
      <UserScopePicker />
      <div className="finance-dashboard">
        <section className="portal-card portal-card--highlight finance-hero">
          <div className="finance-hero-main">
            <div className="finance-hero-copy">
              <p className="portal-pill">Resumo</p>
              <h2>Centralize cobranças e assinaturas em um só lugar.</h2>
              <p className="subtle">
                Envie faturas para seus alunos, acompanhe os pagamentos e gerencie sua assinatura do assistente.
              </p>
              <div className="finance-hero-actions">
                <Link href="/financeiro/personal#nova-fatura" className="button">
                  Enviar fatura
                </Link>
                <Link href="/financeiro/aluno" className="button secondary">
                  Financeiro do aluno
                </Link>
                <Link href="/financeiro/subscription" className="button secondary">
                  Assinatura
                </Link>
              </div>
            </div>
            <div className="finance-summary-grid finance-summary-grid--hero">
              <div className="finance-summary-card">
                <span>Total pendente</span>
                <strong>{formatCurrency(totalPendente)}</strong>
              </div>
              <div className="finance-summary-card">
                <span>Recebido</span>
                <strong>{formatCurrency(totalRecebido)}</strong>
              </div>
              <div className="finance-summary-card">
                <span>Próximo vencimento</span>
                <strong>{proximoVencimento ? `Dia ${proximoVencimento}` : '-'}</strong>
              </div>
            </div>
          </div>
        </section>

        <div className="finance-overview-grid">
          <Link href="/financeiro/personal" className="portal-card finance-overview-card">
            <strong>Faturas do personal</strong>
            <span>Crie cobranças e acompanhe os pagamentos dos alunos.</span>
            <em>Enviar agora</em>
          </Link>
          <Link href="/financeiro/aluno" className="portal-card finance-overview-card">
            <strong>Financeiro do aluno</strong>
            <span>Visualize pagamentos pendentes e links do Stripe.</span>
            <em>Ver detalhes</em>
          </Link>
          <Link href="/financeiro/subscription" className="portal-card finance-overview-card">
            <strong>Assinatura do assistente</strong>
            <span>Controle o plano ativo e as renovações no Stripe.</span>
            <em>Gerenciar</em>
          </Link>
        </div>
      </div>

      <div className="portal-card finance-section">
        <div className="finance-card-header">
          <div>
            <h3>Pagamentos recentes</h3>
            <p className="subtle">Resumo rápido das últimas cobranças registradas.</p>
          </div>
          <Link href="/financeiro/aluno" className="students-action">
            Ver detalhes
          </Link>
        </div>
        {!userId && <p className="subtle">Selecione um perfil para ver os pagamentos recentes.</p>}
        {userId && orderedPayments.length === 0 && <p className="subtle">Nenhum pagamento encontrado.</p>}
        {userId && orderedPayments.length > 0 && (
          <div className="finance-payments-grid">
            {orderedPayments.slice(0, 6).map((payment) => (
              <div key={payment.id} className="finance-payment-card">
                <div className="finance-payment-header">
                  <div className="finance-payment-title">
                    <span className={`finance-payment-tag ${payment.pago ? 'is-paid' : 'is-pending'}`}>
                      {payment.pago ? 'Pago' : 'Pendente'}
                    </span>
                    <strong>{payment.descricao || 'Cobrança'}</strong>
                  </div>
                  <span className="finance-payment-value">
                    {formatCurrency(payment.valorDaCombranca || 0)}
                  </span>
                </div>
                <p className="finance-payment-meta">
                  Vencimento {payment.todoDiaDoMes ? `dia ${payment.todoDiaDoMes}` : '-'}
                </p>
                {payment.datas?.[0] && (
                  <p className="finance-payment-meta">Registrado em {formatDate(payment.datas[0])}</p>
                )}
                {payment.stripeStatus && (
                  <p className="finance-payment-meta">Stripe: {payment.stripeStatus}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

