---
inclusion: manual
---

> Última alteração: 2026-10-08

# Revisão de segurança OWASP

Use esta revisão quando o usuário pedir análise de segurança ou quando uma alteração tocar autenticação, autorização, entrada externa, serialização, chamadas de processo, SQL, HTML, TLS, CORS, criptografia, logs ou segredos.

- Identifique a entrada controlada pelo usuário, o fluxo até o sink e a validação, sanitização ou parametrização aplicada.
- Verifique injeção SQL e de comandos, XSS/HTML inseguro, desserialização insegura, SSRF, controle de acesso quebrado, configuração TLS/CORS, criptografia fraca e exposição de dados sensíveis.
- Classifique cada achado como bloqueante ou alerta; informe arquivo, linha, impacto, evidência, correção e teste recomendado.
- Considere bloqueante segredo hardcoded, SQL injection, command injection, `eval`/`new Function`/`exec` dinâmico e `dangerouslySetInnerHTML` não sanitizado.
- Trate `security-ignore: <categoria> -- <justificativa>` como supressão válida somente quando a justificativa for específica e auditável; não aceite supressão vazia.
- Confirme que mensagens, logs, respostas de erro e telemetria não expõem credenciais, tokens, PII desnecessária ou stack trace.
- Reexecute testes de segurança e validações relevantes após a correção; registre riscos residuais e pendências em pt-BR.
