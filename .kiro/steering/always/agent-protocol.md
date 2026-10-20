---
inclusion: always
---

> Última alteração: 2026-10-08

# Protocolo do Agente_IA

- Antes de escrever código para uma funcionalidade, procure a Spec correspondente em `.kiro/specs/` e leia a Tarefa_Atomica aplicável.
- Se a mudança atingir mais de uma aplicação, criar endpoint, criar página ou criar Modulo_IA sem Spec correspondente, proponha a Spec antes de editar arquivos.
- Execute primeiro todas as tarefas declaradas em `_Depends`; ao concluir uma Tarefa_Atomica, marque sua caixa no `tasks.md` da Spec.
- Se uma instrução explícita do usuário contrariar a Fonte_Canonica_de_Padroes, relate o conflito e aguarde confirmação; a Constituição continua prevalecendo.
- Fixe a versão exata de toda dependência nova e justifique a escolha na alteração. Nunca instale dependências sem autorização do escopo da tarefa.
- Leia e escreva textos em pt-BR, use identificadores em inglês e mantenha segredos em variáveis de ambiente documentadas.
- Não crie commits ou pull requests sem pedido explícito do usuário.
- No Kiro CLI, use o agente de projeto `nuagehub`, definido em `.kiro/agents/nuagehub.json`, para receber hooks e steering condicional.
- Ao concluir uma alteração, relate arquivos afetados, verificações executadas, desvios e pendências sem marcar tarefas fora do escopo.
