# Resumo Admin e registro de erros — 20/10/2026

## Problemas corrigidos

- O registrador de erros enviava propriedades opcionais com `undefined` ao Firestore. A gravação falhava, e a tentativa já ficava marcada como duplicada. Agora os campos ausentes são omitidos; a deduplicação cobre erros intercalados, só começa após gravação bem-sucedida e libera nova tentativa após falha.
- O resumo Admin mostrava zero e status "Estável" quando consultas de usuários, erros ou notificações falhavam. Agora cada família distingue carregamento, indisponibilidade e zero real, com alerta legível e ação de atualização que refaz as três consultas.
- A lista recente abre o mesmo perfil no desktop e no celular. Em telas estreitas, as ações e cartões cabem na largura disponível. Elementos decorativos foram limitados ao painel para evitar rolagem horizontal no desktop.
- Indicadores de integrações baseados apenas na presença de configuração dizem "Configurado" ou "Não verificado", sem sugerir que o serviço externo passou por um teste de saúde.

## Evidência de QA

- Em emuladores locais `demo-mhpersonal`, seis sinais de erro, incluindo erro comum, `ErrorEvent` e rejeição de promessa, produziram cinco documentos distintos esperados em `appErrors`; a repetição intercalada não duplicou o primeiro. Após negar escrita, restaurar a regra e reenviar o mesmo sinal, uma única gravação ocorreu. Esse teste não escreveu em produção.
- Com consultas negadas no emulador, o resumo exibiu três alertas e 20 indicadores desconhecidos; nenhum dos estados de vazio ou "Estável" foi mostrado. A regra original foi restaurada e "Atualizar dados" recuperou os valores.
- Navegador automatizado com contas sintéticas locais: 320, 390 e 1440 px nos temas claro e escuro. A largura do documento coincidiu com a janela, todos os links e botões visíveis no conteúdo ficaram dentro dela, e os alvos móveis medidos tinham pelo menos 48 px de altura.
- O perfil do aluno sintético abriu e fechou no celular e no desktop. O foco voltou ao botão do celular após fechar; `Esc` fechou o painel no desktop.
- TypeScript e análise de CSS passaram. O build de Hosting foi validado separadamente antes da publicação da prévia.

## Limites

As consultas e interações autenticadas foram testadas apenas nos emuladores; acesso HTTP à prévia confirma os arquivos publicados, não um login com dados reais. Ainda falta auditoria das regras do Firestore e de outras rotas/perfis. A contagem de perfis do resumo usa a classificação atual do serviço e requer uma revisão própria para usuários com múltiplos papéis legados.
