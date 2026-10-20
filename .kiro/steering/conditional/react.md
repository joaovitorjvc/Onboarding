---
inclusion: fileMatch
fileMatchPattern: 'apps/web/**'
---

> Última alteração: 2026-10-20

# Padrões do App_Web React

- Escreva o App_Web em TypeScript strict, usando exclusivamente componentes funcionais e hooks.
- Exporte um componente por arquivo; nomeie o arquivo e o componente em PascalCase. Nomeie hooks customizados com `use` em camelCase.
- Organize código específico em `src/features/{feature}/` e componentes genéricos em `src/components/`; tipifique explicitamente todas as props.
- Centralize Tokens_de_Design em um único módulo e preserve a identidade visual do portal: paleta escura, primária `#4f46e5` e fonte Inter; `src/theme/tokens.ts` é a fonte única.
- Faça chamadas ao App_API somente pela camada de cliente HTTP dedicada; mantenha componentes de apresentação sem chamadas de rede.
- Mantenha textos da interface em pt-BR e implemente rótulos acessíveis, navegação por teclado, foco visível e critérios WCAG 2.1 AA verificáveis.
- Preserve a Paridade_Visual com as capturas versionadas em `e2e/__screenshots__/`; regenere-as só em mudança visual intencional e revise as imagens no pull request.
