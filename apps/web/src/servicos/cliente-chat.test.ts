import { describe, expect, it, vi } from 'vitest';
import { criarClienteChat, lerUrlServicoChat } from './cliente-chat';
import type { MensagemHistorico } from './contrato-chat';

const respostaValida = {
  resposta: 'Texto restrito ao corpus.',
  encontrouConteudo: true,
  modulosOrigem: [
    { idModulo: 'entrevista-tecnica', tituloModulo: 'Entrevista técnica', idSecao: 'bant', tituloSecao: 'BANT' },
  ],
  versaoConteudo: 'abc',
};

function resposta(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { 'content-type': 'application/json' } });
}

describe('cliente do chat', () => {
  it('envia POST /api/chat e devolve a resposta validada', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(resposta(respostaValida));
    const cliente = criarClienteChat({ urlBase: 'http://servico', fetchImpl });
    const resultado = await cliente.enviar('Pergunta', []);
    expect(resultado).toEqual({ ok: true, resposta: respostaValida });
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://servico/api/chat');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ mensagem: 'Pergunta', historico: [] });
  });

  it('recorta o histórico para as últimas 10 mensagens', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(resposta(respostaValida));
    const historico: MensagemHistorico[] = Array.from({ length: 15 }, (_, i) => ({
      papel: 'arquiteto',
      texto: `m${i}`,
    }));
    await criarClienteChat({ urlBase: 'http://servico', fetchImpl }).enviar('x', historico);
    const corpo = JSON.parse(String((fetchImpl.mock.calls[0] as [string, RequestInit])[1].body)) as {
      historico: MensagemHistorico[];
    };
    expect(corpo.historico).toHaveLength(10);
    expect(corpo.historico[0]?.texto).toBe('m5');
  });

  it('classifica erros do serviço, sem expor mensagem bruta do provedor', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(resposta({ codigo: 'LIMITE_TAXA', mensagem: 'segredo do provedor' }, 429));
    const resultado = await criarClienteChat({ urlBase: 'http://servico', fetchImpl }).enviar('x', []);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.erro.codigo).toBe('LIMITE_TAXA');
      expect(resultado.erro.recuperavel).toBe(true);
      expect(resultado.erro.mensagem).not.toContain('segredo');
    }
  });

  it('trata corpo fora do contrato como RESPOSTA_INVALIDA', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(resposta({ resposta: 1 }));
    const resultado = await criarClienteChat({ urlBase: 'http://servico', fetchImpl }).enviar('x', []);
    expect(resultado).toMatchObject({ ok: false, erro: { codigo: 'RESPOSTA_INVALIDA' } });
  });

  it('não lança em falha de rede e permite nova tentativa', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const resultado = await criarClienteChat({ urlBase: 'http://servico', fetchImpl }).enviar('x', []);
    expect(resultado).toMatchObject({ ok: false, erro: { codigo: 'REDE', recuperavel: true } });
  });

  it('aborta ao exceder o tempo do cliente', async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, rejeitar) => {
          init?.signal?.addEventListener('abort', () => rejeitar(new DOMException('abortado', 'AbortError')));
        }),
    );
    const resultado = await criarClienteChat({
      urlBase: 'http://servico',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      timeoutMs: 10,
    }).enviar('x', []);
    expect(resultado).toMatchObject({ ok: false, erro: { codigo: 'TEMPO_LIMITE' } });
  });

  it('consulta a saúde do serviço', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    expect(await criarClienteChat({ urlBase: 'http://servico', fetchImpl }).saude()).toBe(true);
  });

  it('lerUrlServicoChat devolve null ou uma URL sem barra final', () => {
    const url = lerUrlServicoChat();
    expect(url === null || !url.endsWith('/')).toBe(true);
  });
});
