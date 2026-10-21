export default function AuthLoading({ title = 'Carregando seu acesso' }: { title?: string }) {
  return (
    <div className="auth-card auth-loading-card" role="status" aria-live="polite" aria-busy="true">
      <div className="auth-card-header">
        <p className="auth-kicker">MH Personal Trainer</p>
        <h1>{title}</h1>
        <p className="subtle">Estamos preparando esta tela. Aguarde um instante.</p>
      </div>
      <progress aria-label="Carregando" style={{ width: '100%', height: 8, accentColor: 'var(--brand-deep)' }} />
    </div>
  );
}
