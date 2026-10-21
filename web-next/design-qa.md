# QA em andamento — MH Personal Web

Última atualização: 21/10/2026. A versão de prévia do Firebase Hosting `f1bc46de7c001720` está publicada em [revisao-20261018](https://profissions-2746d--revisao-20261018-diu2xftd.web.app/login). O QA geral continua aberto; esta rodada valida os fluxos públicos, não as telas autenticadas.

## Evidência desta rodada

- Build de Hosting do Next.js concluído, com TypeScript e 109 páginas estáticas geradas. A saída contém as correções dos formulários e não contém padrões de chaves OpenRouter.
- Em navegador novo, `/login` foi verificado em 320×740, 390×844 e 1440×900. A largura do documento permaneceu igual à largura do viewport; a logo carregou e ficou visível; a navegação de perfil, os campos e o botão de entrada cabem na tela. A página desktop continua verticalmente rolável para mostrar as opções inferiores.
- Em 320×740, `/login`, `/academy-login`, `/login-aluno`, `/personal-login`, `/forgot-password`, `/register-personal`, `/register-academy`, `/register-aluno` e `/register` responderam com HTTP 200, sem overflow horizontal ou imagens quebradas.
- Nos quatro logins, o campo de senha tem o nome acessível “Senha”. O botão alternou entre “Mostrar senha” e “Ocultar senha” e atualizou `aria-pressed` corretamente.
- Envio vazio em recuperação de senha e nos quatro cadastros exibiu a mensagem de validação com `role="alert"`. Os campos obrigatórios estão marcados e nenhuma chamada de autenticação ou criação de conta foi enviada.
- Console do navegador na prévia: zero erros e zero avisos.

## QA ainda necessário

- Renderizar e testar com sessão autenticada as rotas de Aluno, Personal, Academia e Admin em desktop e celular. A sessão disponível não está autenticada; não usar a tela de login como substituta desse teste.
- Completar navegação por teclado, foco, contraste e acessibilidade em todas as telas, inclusive as autenticadas.
- Revisar as regras do Firebase antes de considerar o QA completo: o `firebase.json` da raiz usa `firestore.rules`, que permite leitura e escrita a qualquer usuário autenticado, e `storage.rules`, que permite ler e gravar qualquer arquivo a qualquer usuário autenticado. O `firebase/firebase.json` aponta para outra cópia, `firebase/firestore.rules`, que contém várias permissões `if true` para leitura, gravação e exclusão. A configuração ativa no projeto ainda precisa ser verificada; não alterei nem publiquei regras nesta rodada. Filtros no cliente não são uma barreira de autorização no servidor.
