# Financeiro do personal — QA

Data: 2026-10-23

Rota: `/financeiro/personal`

Ambiente: desenvolvimento local com Firebase Auth e Firestore Emulator; perfil e aluno sintéticos (`example.test`). Nenhuma cobrança foi gravada.

## Correções validadas

- O botão flutuante do chat deixa de cobrir a criação de faturas nesta rota; o link “Abrir chat” do cabeçalho navega para `/chat`.
- O chat flutuante permanece disponível em `/financeiro/plans` e volta a aparecer em `/chat`.
- A ação do cabeçalho fica alinhada à direita no desktop e abaixo do título no celular.
- O PNG da marca foi movido sem alterar seus bytes e é servido como asset público. Isso evita a miniatura Squoosh que interrompia o build estático.

## Matriz visual

| Viewport | Largura do documento | Resultado |
| --- | ---: | --- |
| Desktop 1440 × 900 | 1440 px | Sem overflow horizontal; indicadores em quatro colunas e formulário amplo. |
| Mobile 390 × 844 | 390 px | Sem overflow horizontal; resumo em duas colunas e controles acessíveis por rolagem. |
| Mobile 320 × 740 | 320 px | Sem overflow horizontal; título e formulário permanecem dentro da viewport. |

A navegação móvel fica fixa no rodapé. A tela foi percorrida até o final para confirmar que o botão de envio e a lista de cobranças continuam acessíveis.

## Fluxos e validações

- Playwright confirmou o estado vazio e o formulário para o aluno QA sintético.
- Enviar sem valor foi bloqueado com orientação para informar um valor válido.
- Link HTTP foi rejeitado; o formulário exige HTTPS.
- Uma tentativa de valor de teste atualizou o resumo para R$ 120,00. Nenhuma fatura foi enviada e a coleção de pagamentos continuou com zero documentos.
- Console do navegador: zero erros. Avisos de desenvolvimento foram limitados ao preload de CSS durante Fast Refresh e à recomendação de ferramentas React.
- `npx tsc --noEmit`, `git diff --check` e `npm run build:hosting`: aprovados. O build exportou 109 rotas estáticas usando um worker.

## Limites desta rodada

Stripe não está conectado no perfil sintético, então o link automático e um pagamento real não foram testados. Esta validação cobre a tela Financeiro do personal e o atalho de chat; não equivale a uma auditoria completa de todas as rotas.

## Publicação nos canais de QA

- `qa-home-mobile-20261023`: versão `08503c85b81b3598`, expira em 2026-10-30.
- `revisao-20261018`: versão `d9dc81fa3fd6c94c`, expira em 2026-10-30.
- Em ambos, `/login`, `/financeiro/personal` e `/brand/PT_transparente.png` retornaram HTTP 200.
- Playwright no canal publicado confirmou a logo carregada em 1280 × 720 e 390 × 844; no celular, a largura do documento permaneceu em 390 px. Console publicado: zero erros e zero avisos.
- A publicação ficou restrita aos canais temporários de QA; o canal `live` e o domínio principal não foram atualizados.

## Capturas

- [Desktop 1440 × 900](finance-personal-desktop-1440.png)
- [Mobile 390 × 844](finance-personal-mobile-390.png)
- [Mobile 320 × 740](finance-personal-mobile-320.png)
- [Mobile — formulário e cobranças ao rolar](finance-personal-mobile-bottom-390.png)
- [Login publicado — desktop 1280 × 720](qa-login-desktop-1280.png)
- [Login publicado — mobile 390 × 844](qa-login-mobile-390.png)
