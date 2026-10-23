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

# Login — transição de tema dos links auxiliares — QA

Data: 2026-10-23

Rota: `/login`

Prévia Firebase Hosting: [qa-login-theme-20261023](https://profissions-2746d--qa-login-theme-20261023-gs3i0hzp.web.app/login), versão `ac49e4dd4bd79adb`, expira em 2026-10-30.

## Correção validada

- Removida a animação do fundo dos links “Criar conta” e “Entrar” nas opções auxiliares. Ao mudar do tema escuro para o claro, o fundo agora troca junto com o cartão, sem o estado intermediário escuro e com baixo contraste que aparecia na captura.
- A cor da borda ainda pode animar; o fundo e o texto passam imediatamente para a paleta do tema ativo.

## Matriz visual hospedada

| Viewport | Largura do documento | Link auxiliar no tema claro | Resultado |
| --- | ---: | --- | --- |
| 320 × 740 | 320 px | 48 px de altura | Sem overflow; tema claro e escuro coerentes |
| 390 × 844 | 390 px | 48 px de altura | Sem overflow; tema claro e escuro coerentes |
| 472 × 270 | 472 px | 48 px de altura | Sem overflow; sem estado intermediário escuro |
| 768 × 1024 | 768 px | 48 px de altura | Sem overflow; tema claro e escuro coerentes |
| 1024 × 768 | 1024 px | 48 px de altura | Sem overflow |
| 1280 × 900 | 1280 px | 48 px de altura | Sem overflow |

Os campos de e-mail e senha mantiveram altura de 49 px nos viewports móveis. Console e erros de página no navegador: zero. O CSS gerado foi verificado e não anima `background-color`; a compilação de Hosting exportou 109 rotas e passou pela checagem de tipos. Nenhuma chave OpenRouter foi encontrada no JavaScript estático.

## Capturas

- [320 × 740](login-theme-transition-320.png)
- [390 × 844](login-theme-transition-390.png)
- [472 × 270](login-theme-transition-472.png)

Esta validação cobre o login e a transição de tema dos links auxiliares; não representa auditoria concluída de todas as rotas do aplicativo.
