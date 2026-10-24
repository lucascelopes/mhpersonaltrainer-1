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

# Páginas públicas — Academia, Benefícios e Equipe — QA

Data: 2026-10-23

Prévia Firebase Hosting: [qa-academia-dark-20261023](https://profissions-2746d--qa-academia-dark-20261023-ejkcw66z.web.app/academia), versão `12e299b0f03bf378`, expira em 2026-10-30. A prévia não substitui o canal `live`.

## Correções em `/academia`

- No tema escuro, cartões de indicadores, funcionalidades e galeria agora usam superfícies escuras; o fluxo operacional, a chamada final e o botão secundário acompanham a mesma paleta. Títulos e textos continuam legíveis sobre esses fundos.
- A abertura superior do hero foi reduzida em celulares de 92 px fixos para `clamp(52px, 14vw, 68px)`, trazendo o título e os botões para mais perto do menu.
- O azul claro dos títulos de funcionalidade mantém contraste aproximado de 7.3:1 sobre a superfície do cartão; o texto secundário fica em torno de 8.2:1.

## Matriz responsiva

| Rota | Viewport | Largura do documento | Resultado |
| --- | --- | ---: | --- |
| `/` | 320 × 740 | 305/305 px | Sem overflow; menu móvel e âncora `#produto` verificados; imagens carregadas após percorrer a página. |
| `/` | 390 × 844 | 375/375 px | Sem overflow; chamadas de ação dentro da viewport. |
| `/` | 1440 × 900 | 1425/1425 px | Sem overflow; imagens carregadas e console sem erros. |
| `/academia` | 320 × 740 | 305/305 px | Hero em uma coluna; CTA e início dos indicadores visíveis; cartões escuros. |
| `/academia` | 390 × 844 | 375/375 px | Sem overflow; botões e cartões dentro da viewport. |
| `/academia` | 1440 × 900 | 1425/1425 px | Hero em duas colunas (593 + 570 px); funcionalidades em quatro colunas; galeria em três. |
| `/beneficios` | 320 × 740 | 305/305 px | Sem overflow; CTA e primeira imagem permanecem acessíveis. |
| `/beneficios` | 390 × 844 | 375/375 px | Hero em uma coluna; chamadas de ação e imagem sem cortes. |
| `/beneficios` | 1440 × 900 | 1425/1425 px | Hero em duas colunas; cartões e chamada final em grade responsiva. |
| `/equipe` | 320 × 740 | 305/305 px | Texto, botões e cartões empilhados sem cortes. |
| `/equipe` | 390 × 844 | 375/375 px | Sem overflow; cartões de suporte legíveis. |
| `/equipe` | 1440 × 900 | 1425/1425 px | Hero em duas colunas (592 + 536 px), sem overflow. |

Os 15 px de diferença entre o viewport e a largura do documento correspondem à barra de rolagem vertical. As páginas `/academia`, `/beneficios` e `/equipe` foram percorridas; 8/8, 5/5 e nenhuma imagem, respectivamente, falharam. Console do navegador nessas três rotas: zero erros.

## Fluxos, build e publicação

- `/`, `/academia`, `/register-academy`, `/academy-login`, `/beneficios`, `/equipe` e `/brand/PT_transparente.png` retornaram HTTP 200 no canal QA.
- `npm run build:hosting`: aprovado; exportou 109 rotas estáticas e passou por lint e checagem de tipos. Foram carregadas apenas as variáveis públicas `NEXT_PUBLIC_FIREBASE_*`; o build exportado não contém padrão de chave OpenRouter.
- `git diff --check`: aprovado.
- A atualização foi publicada no canal temporário `qa-academia-dark-20261023`. Nenhum deploy foi feito para produção; nenhuma conta ou dado real foi alterado.

Esta rodada cobre a home e três páginas públicas de marketing. Login autenticado, áreas privadas e todos os fluxos do produto continuam fora desta verificação.

# Login de Personal sem código — QA

Data: 2026-10-23

Prévia Firebase Hosting: [qa-personal-auth-20261023](https://profissions-2746d--qa-personal-auth-20261023-9hmx1qdv.web.app/login), versão `9751f9681c8610a7`, expira em 2026-10-30.

## Correção validada

- Perfis de Personal sem `codigoPersonal` agora entram no painel imediatamente; o login não consulta a lista de usuários nem deixa a sessão presa enquanto procura um código.
- Um código ausente é verificado pelo callable `previewPersonalInvite` já usado no cadastro e reservado com o documento do código em uma transação. Chamadas simultâneas do listener de autenticação compartilham a mesma reserva, e um conflito consulta novamente o perfil antes de tentar outro candidato.
- Se o serviço de convites estiver indisponível, o acesso continua aberto e o erro de geração fica restrito ao console; falha de atualização de atividade também não encerra a sessão.
- Respostas atrasadas do carregamento de perfil só atualizam a tela enquanto a conta continua sendo a mesma, evitando restaurar uma sessão antiga após sair ou trocar de usuário.

## Matriz responsiva e de autenticação

| Área/rota | Viewport | Resultado |
| --- | --- | --- |
| Prévia `/login` | 1280 × 720 | Carregada no canal QA, tema escuro, sem overflow horizontal. |
| Prévia `/login` | 390 × 844 | 375 px de conteúdo; opções auxiliares com 48 px de altura, sem overflow. |
| Prévia `/login` | 320 × 740 | 305 px de conteúdo; campos e botões permanecem dentro da tela. |
| Login sintético e `/app` | 320 × 740 e desktop | Conta de teste criada sem código entrou; código novo apareceu no painel e ficou salvo no perfil e no índice `personalCodes` do emulador. |
| `/students`, `/workouts`, `/schedule`, `/financeiro/personal`, `/profile` | 320 × 740 | Todas carregaram; largura do documento 305 px, sem overflow horizontal ou tela de erro. |
| Mesmas rotas privadas | 1440 × 900 | Todas carregaram sem overflow ou tela de erro; Financeiro exibiu os cartões de seleção e Stripe em duas colunas. |
| Financeiro do Personal | claro e escuro, desktop e mobile | Superfícies acompanham o tema; nenhuma superfície branca ampla no conteúdo escuro. |

A autenticação foi exercitada somente no emulador local `demo-mhpersonal-audit`, com perfis e códigos sintéticos. Não foi iniciado login com conta de Personal real nem alterado dado de produção. O console não teve erros novos após a correção; os avisos de conflito observados pertencem à primeira versão do teste antes da reserva única e não se repetiram no reteste.

`npm run build:hosting` passou pela compilação, lint e checagem de tipos e exportou 109 rotas. A varredura dos chunks encontrou zero strings de chave OpenRouter; o marcador de build `hosting-preview-disabled` aparece no bundle. A URL temporária do Firebase respondeu no navegador e permanece válida até 2026-10-30. Nenhum deploy foi feito no canal `live`, e as regras do Firestore não foram alteradas.

Esta é uma rodada de login e de seis rotas do Personal. Ela amplia a cobertura privada anterior, mas não conclui a auditoria de todas as rotas, perfis e fluxos do produto.

# Login e cadastro móvel — QA e publicação

Data: 2026-10-23

Prévia Firebase Hosting: [qa-login-register-20261023](https://profissions-2746d--qa-login-register-20261023-bqww3r8s.web.app/login), versão `de86de85919f424e`, expira em 2026-10-30.

Publicação verificada no canal principal Firebase Hosting e no domínio [mhpersonaltrainer.com.br](https://mhpersonaltrainer.com.br/login). O endereço Firebase padrão também está ativo: [profissions-2746d.web.app](https://profissions-2746d.web.app/login).

## Correção validada

- Em telas de até 960 px, removida a lista repetida de opções de acesso abaixo do formulário de login. Uma faixa compacta “Ainda não tem conta? Criar conta” leva ao seletor de perfil em `/cadastro`.
- Em desktop, as opções completas de acesso continuam visíveis. O botão de mostrar/ocultar senha e a validação de campos vazios também foram exercitados.

## Verificação da prévia e produção

- 17 rotas públicas verificadas em 320 × 740 e 1440 × 900: 34/34 verificações passaram, sem overflow horizontal, erros de página ou erros de console. Rotas: `/`, `/academia`, `/beneficios`, `/equipe`, `/login`, `/login-aluno`, `/personal-login`, `/academy-login`, `/forgot-password`, `/register`, `/register-personal`, `/register-academy`, `/register-aluno`, `/cadastro`, `/account-deletion`, `/privacy` e `/terms`.
- A mesma matriz 34/34 passou no domínio de produção após a publicação.
- Testes adicionais em `/login` nos tamanhos 320, 390, 768, 1024 e 1440 px confirmaram a troca responsiva entre a chamada compacta e as opções desktop. O link de cadastro abriu o seletor de perfil em mobile; mostrar/ocultar senha e mensagem de campos obrigatórios funcionaram.
- Build de Hosting aprovado: 109 rotas estáticas, lint e checagem de tipos concluídos. O JavaScript exportado não contém padrão de chave OpenRouter e contém o marcador `hosting-preview-disabled`.
- A publicação alterou apenas Hosting. Nenhuma regra, função, conta ou dado real foi alterado.

Esta rodada valida as rotas públicas e o fluxo de cadastro a partir do login, mas não conclui a auditoria de todas as rotas privadas, perfis e fluxos autenticados.

# Painéis Admin, Academia e Aluno — responsividade e tema — QA

Data: 2026-10-24

## Correções desta rodada

- Admin em telas estreitas: a navegação mantém largura utilizável dentro do painel, a área de versão deixa de comprimir os links e os elementos decorativos do resumo deixam de aumentar a página. Gráficos ocultos não acrescentam largura enquanto aguardam interação.
- Academia: o brilho decorativo do painel e do cabeçalho fica contido no cartão em celular.
- Aluno: cartões da home, atalhos e estados vazios usam superfícies e texto do tema escuro. O estado sem treinos também mantém contraste no tema escuro; o tema claro preserva a paleta clara.

## Matriz responsiva autenticada

Contas sintéticas foram usadas somente com Auth e Firestore Emulator local (`demo-mhpersonal-audit`). Nenhuma conta, regra ou dado real foi alterado.

| Perfil e rota | Viewports | Resultado |
| --- | --- | --- |
| Admin `/admin` e `/admin/users` | 320 × 740, 390 × 844 e 1440 × 900 | Navegação visível e sem overflow horizontal do documento. |
| Academia `/academy` | 320 × 740, 390 × 844 e 1440 × 900 | Sem overflow horizontal; glow contido no painel. A conta sintética entrou, mas a base isolada não tinha registros operacionais, então o painel exibiu aviso de carregamento. |
| Aluno `/app` | 320 × 740 e 390 × 844 | Sem overflow horizontal; cartões escuros legíveis. |
| Aluno `/workouts` | 320 × 740 | Estado vazio legível nos temas claro e escuro; sem overflow horizontal. |

## Build e publicação

- Build Hosting aprovado: 109 rotas estáticas; compilação, lint e checagem de tipos concluídos. O export contém 745 arquivos. A varredura não encontrou chave OpenRouter no JavaScript publicado.
- Publicação concluída apenas em Firebase Hosting no projeto `profissions-2746d`. Versão `10c2e1d231eab601`, release live `1792840224862000` em 2026-10-24 11:10 UTC.
- `https://mhpersonaltrainer.com.br/`, `/login` e o Hosting padrão responderam HTTP 200. O CSS servido pelo domínio contém as correções de tema do aluno, do estado vazio de treinos e do layout mobile da academia.
- O endereço escrito como `mhpersonaltrainer.dcom.br` não tem registro DNS; o domínio publicado é `mhpersonaltrainer.com.br`.

Esta rodada corrige e verifica as superfícies listadas, mas não representa auditoria completa de todos os módulos, perfis ou fluxos autenticados.
