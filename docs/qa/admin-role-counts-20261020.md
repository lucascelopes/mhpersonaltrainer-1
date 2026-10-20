# Contagem e classificação dos perfis Admin — 20/10/2026

O resumo Admin somava consultas independentes de `admin`, `academyAccount` e `professorAccount` e calculava alunos por subtração. Usuários com mais de uma marca eram contados em mais de uma categoria; registros antigos com `"true"` ou `1` ficavam fora das consultas booleanas. O total podia não bater com `/admin/users`.

O resumo agora lê a coleção de usuários do servidor e classifica cada registro uma vez, com a mesma prioridade do acesso do app: Admin com e-mail `@admin.com`, Academia, Personal, Aluno. A lista recente deriva da mesma leitura. `/admin/users`, o perfil lateral, `/admin/students` e a ficha do aluno usam essa classificação compartilhada.

No emulador `demo-mhpersonal`, foram inseridos seis registros sintéticos com marcas sobrepostas, texto `"true"`, número `1` e uma marca Admin em e-mail fora do domínio. Com os dois registros iniciais, o resumo mostrou 8 usuários = 3 admins + 2 academias + 1 personal + 2 alunos. `/admin/users` apresentou os mesmos totais; `/admin/students` mostrou os dois alunos, e a ficha do registro com marca Admin fora do domínio abriu como Aluno. A negação temporária de consultas exibiu três alertas e 20 métricas desconhecidas; restaurar as regras locais e atualizar recuperou 8/1/2/2/3 na ordem do resumo. TypeScript passou nos dois checkouts.

Essa correção prioriza contagens exatas: o resumo lê todos os documentos de `users` quando carrega ou é atualizado. Para uma base grande, o custo e a latência dessa leitura devem ser medidos; contadores agregados mantidos no backend podem substituí-la. Os testes autenticados foram locais e não alteraram usuários reais.
