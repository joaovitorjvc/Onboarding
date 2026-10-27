import { act, cleanup, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TRILHA } from '../conteudo/trilha';
import { GLOSSARIO } from '../conteudo/glossario';
import { coletarPendencias } from '../dominio/pendencias/coletar';
import { CHAVE_PROGRESSO } from '../dominio/progresso/armazenamento';
import { useChat } from '../hooks/useChat';
import type { ClienteChat, ResultadoChat } from '../servicos/cliente-chat';
import { erroChat } from '../servicos/cliente-chat';
import { ArmazenamentoEmMemoria } from '../testes-apoio/armazenamento-em-memoria';
import { renderizar } from '../testes-apoio/renderizar';
import { TRILHA_EXEMPLO } from '../testes-apoio/trilha-exemplo';

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
});

const titulo = (nome: string | RegExp) => screen.getByRole('heading', { level: 1, name: nome });

describe('rotas', () => {
  it.each([
    ['/', 'Nuage It Plataforma de Onboarding'],
    ['/trilha', 'Trilha'],
    ['/trilha/entrevista-tecnica', 'Entrevista técnica'],
    ['/trilha/entrevista-tecnica/secao/bant', 'O BANT entregue pelo Account Manager'],
    ['/triagem', 'Triagem de escopo'],
    ['/busca', 'Busca'],
    ['/glossario', 'Glossário'],
    ['/referencias', 'Referências'],
    ['/pendencias', 'Pendências'],
    ['/nao-existe', 'Página não encontrada'],
    ['/trilha/modulo-inexistente', 'Página não encontrada'],
    ['/trilha/kickoffs/secao/inexistente', 'Página não encontrada'],
  ])('%s exibe o título "%s"', (rota, nome) => {
    renderizar(rota, { armazenamento: new ArmazenamentoEmMemoria() });
    expect(titulo(nome)).toBeTruthy();
  });

  it('lista os 11 Módulos na Trilha, na ordem canônica', () => {
    renderizar('/trilha', { armazenamento: new ArmazenamentoEmMemoria() });
    const links = within(screen.getByRole('main')).getAllByRole('link');
    expect(links).toHaveLength(11);
    links.forEach((link, indice) => {
      const modulo = TRILHA[indice];
      expect(link.querySelector('.oculto')?.textContent).toBe(`Módulo ${modulo?.posicao}:`);
      expect(link.querySelector('.nuage-cartao-modulo__titulo')?.textContent).toBe(modulo?.titulo);
    });
  });

  it('usa o nome Nuage It Plataforma de Onboarding no título da aba, na marca e no H1 do Início', () => {
    const { container } = renderizar('/glossario', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(document.title).toBe('Glossário — Nuage It Plataforma de Onboarding');
    expect(container.querySelector('.nuage-marca')?.textContent).toBe('NuageIT');
    expect(container.querySelector('.nuage-marca-subtitulo')?.textContent).toBe('Plataforma de Onboarding');
    expect(container.textContent).not.toContain('Onboarding SDR');
    expect(container.textContent).not.toContain('Onboarding Solutions');
  });

  it('monta o enquadramento da aplicação com as classes do roteiro', () => {
    const { container } = renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(container.querySelector('.nuage-aplicacao > .nuage-atalho')).not.toBeNull();
    expect(container.querySelector('.nuage-aplicacao > .nuage-barra-lateral')).not.toBeNull();
    expect(
      container.querySelector(
        '.nuage-aplicacao > .nuage-area-conteudo > main#conteudo-principal.nuage-corpo.nuage-prosa',
      ),
    ).not.toBeNull();
    expect(container.querySelector('.nuage-area-conteudo > footer.nuage-rodape')).not.toBeNull();
    expect(container.querySelector('.nuage-aplicacao > .nuage-chat-ancora > .nuage-chat-gatilho')).not.toBeNull();
    expect(
      container.querySelector('.nuage-pagina > .nuage-pagina-cabecalho > .nuage-sobretitulo[aria-hidden="true"]'),
    ).not.toBeNull();
    expect(container.querySelectorAll('.nuage-faixa-indicadores > .nuage-indicador')).toHaveLength(3);
    expect(container.querySelectorAll('.nuage-segmentos > .nuage-segmento')).toHaveLength(11);
  });

  it('marca exatamente um item de navegação com aria-current', () => {
    renderizar('/busca', { armazenamento: new ArmazenamentoEmMemoria() });
    const navegacao = screen.getByRole('navigation', { name: 'Navegação principal' });
    const atuais = within(navegacao)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(atuais.map((link) => link.textContent)).toEqual(['Busca']);
  });

  it('tem atalho para o conteúdo principal e landmark focável', () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(screen.getByRole('link', { name: 'Ir para o conteúdo principal' }).getAttribute('href')).toBe(
      '#conteudo-principal',
    );
    const principal = screen.getByRole('main');
    expect(principal.id).toBe('conteudo-principal');
    expect(principal.getAttribute('tabindex')).toBe('-1');
  });
});

describe('progresso', () => {
  it('navegar não grava no armazenamento', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    const { container } = renderizar('/', { armazenamento });
    const usuario = userEvent.setup();
    await usuario.click(within(container).getByRole('link', { name: 'Trilha' }));
    await usuario.click(within(container).getByRole('link', { name: 'Glossário' }));
    expect(armazenamento.gravacoes).toBe(0);
    expect(armazenamento.dados.size).toBe(0);
  });

  it('concluir um Módulo grava, atualiza o percentual e permite reabrir', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    renderizar('/trilha/visao-da-area', { armazenamento });
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Marcar módulo como concluído' }));
    const salvo = JSON.parse(armazenamento.dados.get(CHAVE_PROGRESSO) ?? 'null') as {
      modulos: Record<string, { concluido: boolean }>;
    };
    expect(salvo.modulos['visao-da-area']?.concluido).toBe(true);
    expect(screen.getByRole('progressbar', { name: 'Progresso da Trilha' }).getAttribute('aria-valuenow')).toBe('9');
    await usuario.click(screen.getByRole('button', { name: 'Reabrir módulo' }));
    expect(screen.getByRole('progressbar', { name: 'Progresso da Trilha' }).getAttribute('aria-valuenow')).toBe('0');
  });

  it('restaura o progresso salvo ao montar', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.dados.set(
      CHAVE_PROGRESSO,
      JSON.stringify({
        versaoSchema: 1,
        modulos: { 'visao-da-area': { concluido: true, atualizadoEm: 'x' } },
        checklists: {},
        atualizadoEm: 'x',
      }),
    );
    renderizar('/', { armazenamento });
    expect(screen.getByText('1/11')).toBeTruthy();
    expect(screen.getByRole('link', { name: /^Módulo 2: Acessos iniciais/u })).toBeTruthy();
  });

  it('falha de gravação mantém o estado anterior e avisa', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.falharGravacao = true;
    renderizar('/trilha/visao-da-area', { armazenamento });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Marcar módulo como concluído' }));
    expect(screen.getByRole('button', { name: 'Marcar módulo como concluído' })).toBeTruthy();
    expect(armazenamento.dados.size).toBe(0);
  });

  it('armazenamento indisponível deixa a interface em somente leitura', () => {
    renderizar('/', { armazenamento: null });
    expect(screen.getByText(/armazenamento do navegador está indisponível/u)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Reiniciar progresso' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('somente leitura desabilita a conclusão do Módulo', () => {
    renderizar('/trilha/visao-da-area', { armazenamento: null });
    expect((screen.getByRole('button', { name: 'Marcar módulo como concluído' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('o reinício exige confirmação e o cancelamento não toca o armazenamento', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.dados.set(
      CHAVE_PROGRESSO,
      JSON.stringify({ versaoSchema: 1, modulos: {}, checklists: {}, atualizadoEm: 'x' }),
    );
    renderizar('/', { armazenamento });
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Reiniciar progresso' }));
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(armazenamento.dados.has(CHAVE_PROGRESSO)).toBe(true);
    await usuario.click(screen.getByRole('button', { name: 'Reiniciar progresso' }));
    await usuario.click(screen.getByRole('button', { name: 'Confirmar reinício' }));
    expect(armazenamento.dados.has(CHAVE_PROGRESSO)).toBe(false);
  });
});

describe('busca', () => {
  it('encontra seções por título, com links diretos, ignorando acentos e caixa', async () => {
    renderizar('/busca', { armazenamento: new ArmazenamentoEmMemoria() });
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Termo de busca'), 'ENTREVISTA');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    const link = screen.getByRole('link', { name: 'Entrevista técnica — Sequência da etapa' });
    expect(link.getAttribute('href')).toBe('/trilha/entrevista-tecnica/secao/sequencia-da-etapa');
  });

  it('termo curto preserva a lista anterior e o termo digitado', async () => {
    renderizar('/busca', { armazenamento: new ArmazenamentoEmMemoria() });
    const usuario = userEvent.setup();
    const campo = screen.getByLabelText('Termo de busca') as HTMLInputElement;
    await usuario.type(campo, 'bant');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getAllByRole('link', { name: /BANT/u }).length).toBeGreaterThan(0);
    await usuario.clear(campo);
    await usuario.type(campo, 'b');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert').textContent).toContain('pelo menos 2');
    expect(campo.value).toBe('b');
    expect(screen.getAllByRole('link', { name: /BANT/u }).length).toBeGreaterThan(0);
  });

  it('sem resultado informa o termo submetido', async () => {
    renderizar('/busca', { armazenamento: new ArmazenamentoEmMemoria() });
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Termo de busca'), 'zzzzzz');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByText('Nenhum resultado para “zzzzzz”.')).toBeTruthy();
  });
});

describe('triagem', () => {
  it('AWS leva à Entrevista técnica', async () => {
    renderizar('/triagem', { armazenamento: new ArmazenamentoEmMemoria() });
    const usuario = userEvent.setup();
    await usuario.selectOptions(screen.getByLabelText('Provedor de nuvem'), 'aws');
    await usuario.click(screen.getByRole('button', { name: 'Decidir escopo' }));
    expect(screen.getByRole('link', { name: 'Entrevista técnica' }).getAttribute('href')).toBe(
      '/trilha/entrevista-tecnica',
    );
  });

  it('GCP sem migração aciona a CAVA; GCP com migração é pendência do Gestor', async () => {
    renderizar('/triagem', { armazenamento: new ArmazenamentoEmMemoria() });
    const usuario = userEvent.setup();
    await usuario.selectOptions(screen.getByLabelText('Provedor de nuvem'), 'gcp');
    await usuario.click(screen.getByRole('button', { name: 'Decidir escopo' }));
    expect(screen.getByText(/natureza de migração/u)).toBeTruthy();
    await usuario.click(screen.getByLabelText('Não'));
    await usuario.click(screen.getByRole('button', { name: 'Decidir escopo' }));
    expect(screen.getByText(/acionamento da CAVA/u)).toBeTruthy();
    await usuario.click(screen.getByLabelText('Sim'));
    await usuario.click(screen.getByRole('button', { name: 'Decidir escopo' }));
    expect(screen.getByText(/Pendência do Gestor/u)).toBeTruthy();
  });

  it('não persiste nada', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    renderizar('/triagem', { armazenamento });
    const usuario = userEvent.setup();
    await usuario.selectOptions(screen.getByLabelText('Provedor de nuvem'), 'aws');
    await usuario.click(screen.getByRole('button', { name: 'Decidir escopo' }));
    expect(armazenamento.gravacoes).toBe(0);
  });
});

describe('consulta', () => {
  it('o glossário filtra por categoria', async () => {
    renderizar('/glossario', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(screen.getAllByRole('term').length).toBe(GLOSSARIO.length);
    await userEvent.setup().selectOptions(screen.getByLabelText('Categoria'), 'Esta plataforma');
    expect(
      screen
        .getAllByRole('term')
        .map((termo) => termo.textContent)
        .sort(),
    ).toEqual(['Módulo', 'Registro de Progresso', 'Trilha']);
  });

  it('pendências refletem a projeção derivada do conteúdo', () => {
    renderizar('/pendencias', { armazenamento: new ArmazenamentoEmMemoria() });
    const linhas = within(screen.getByRole('table')).getAllByRole('row');
    expect(linhas).toHaveLength(coletarPendencias(TRILHA, GLOSSARIO).length + 1);
  });

  it('referências vazias informam que não há citações confirmadas', () => {
    renderizar('/referencias', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(screen.getByText('Nenhuma referência confirmada até o momento.')).toBeTruthy();
  });

  it('conteúdo pendente exibe a marcação em vez de valor', () => {
    renderizar('/trilha/entrevista-tecnica/secao/bant', { armazenamento: new ArmazenamentoEmMemoria() });
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0);
    expect(screen.getByText(/Requisito: /u)).toBeTruthy();
  });
});

describe('variantes de seção', () => {
  const abrir = (secao: string, armazenamento = new ArmazenamentoEmMemoria()) =>
    renderizar(`/trilha/visao-da-area/secao/${secao}`, { armazenamento, trilha: TRILHA_EXEMPLO });

  it('texto, lista, passos e referências', () => {
    abrir('s-texto');
    expect(screen.getByText('Parágrafo de exemplo.')).toBeTruthy();
    cleanup();
    abrir('s-lista');
    expect(screen.getByText('Descrição A', { exact: false })).toBeTruthy();
    cleanup();
    abrir('s-passos');
    expect(
      within(screen.getByRole('main'))
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Primeiro', 'Segundo']);
    cleanup();
    abrir('s-referencias');
    expect(screen.getByText('docs/exemplo/arquivo.md').tagName).toBe('CODE');
    expect(within(screen.getByRole('main')).queryAllByRole('link', { name: /arquivo\.md/u })).toHaveLength(0);
  });

  it('comparativa usa tabela com cabeçalhos de coluna', () => {
    abrir('s-comparativa');
    const colunas = screen.getAllByRole('columnheader');
    expect(colunas.map((c) => c.textContent)).toEqual(['Critério', 'Interno', 'Externo']);
    expect(colunas.every((c) => c.getAttribute('scope') === 'col')).toBe(true);
  });

  it('checklist grava cada item individualmente', async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    abrir('s-checklist', armazenamento);
    await userEvent.setup().click(screen.getByRole('checkbox', { name: /Acesso ao ClickUp/u }));
    const salvo = JSON.parse(armazenamento.dados.get(CHAVE_PROGRESSO) ?? 'null') as {
      checklists: Record<string, Record<string, boolean>>;
    };
    expect(salvo.checklists['visao-da-area']).toEqual({ clickup: true });
    expect((screen.getByRole('checkbox', { name: /Acesso ao Kiro/u }) as HTMLInputElement).checked).toBe(false);
  });

  it('checklist em somente leitura fica desabilitado', () => {
    renderizar('/trilha/visao-da-area/secao/s-checklist', { armazenamento: null, trilha: TRILHA_EXEMPLO });
    for (const caixa of screen.getAllByRole('checkbox')) expect((caixa as HTMLInputElement).disabled).toBe(true);
  });

  it('banco de perguntas renderiza só os conjuntos da situação escolhida', async () => {
    abrir('s-banco');
    const usuario = userEvent.setup();
    const situacao = screen.getByLabelText('Situação da oportunidade');
    expect(screen.getAllByRole('heading', { level: 3, name: 'PoC', hidden: true }).length).toBe(7);
    expect(screen.queryAllByRole('heading', { level: 3, name: 'Adicionais de MVP', hidden: true })).toHaveLength(0);
    await usuario.selectOptions(situacao, 'mvp-apos-poc');
    expect(screen.queryAllByRole('heading', { level: 3, name: 'PoC', hidden: true })).toHaveLength(0);
    expect(screen.getAllByRole('heading', { level: 3, name: 'Adicionais de MVP', hidden: true }).length).toBe(7);
    await usuario.selectOptions(situacao, 'mvp-direto');
    expect(screen.getAllByRole('heading', { level: 3, hidden: true }).length).toBe(14);
  });

  it('fórmula é só texto: sem campos nem botões de cálculo', () => {
    abrir('s-formula');
    const principal = screen.getByRole('main');
    expect(screen.getByText('custo = horas × valor_hora').tagName).toBe('CODE');
    expect(principal.querySelector('input, select, textarea, button')).toBeNull();
  });

  it('modelo de prompt preserva o bloco literal', () => {
    abrir('s-prompt');
    expect(screen.getByLabelText('Bloco literal 1').textContent).toBe('Prompt base\n  com indentação <tag> & "aspas"');
  });
});

describe('chat', () => {
  const sucesso: ResultadoChat = {
    ok: true,
    resposta: {
      resposta: 'Resposta com base no conteúdo.',
      encontrouConteudo: true,
      modulosOrigem: [
        { idModulo: 'entrevista-tecnica', tituloModulo: 'Entrevista técnica', idSecao: 'bant', tituloSecao: 'BANT' },
      ],
      versaoConteudo: 'v1',
    },
  };

  function clienteFalso(...resultados: ResultadoChat[]): ClienteChat & { enviar: ReturnType<typeof vi.fn> } {
    const enviar = vi.fn();
    for (const resultado of resultados) enviar.mockResolvedValueOnce(resultado);
    return { enviar, saude: vi.fn().mockResolvedValue(true) };
  }

  it('está disponível em qualquer rota e exibe resposta com fonte', async () => {
    const cliente = clienteFalso(sucesso);
    renderizar('/glossario', { armazenamento: new ArmazenamentoEmMemoria(), clienteChat: cliente });
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Abrir assistente' }));
    await usuario.type(screen.getByLabelText('Pergunta ao assistente'), 'O que é BANT?');
    await usuario.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(screen.getByText('Resposta com base no conteúdo.', { exact: false })).toBeTruthy());
    expect(screen.getByRole('link', { name: 'Entrevista técnica — BANT' }).getAttribute('href')).toBe(
      '/trilha/entrevista-tecnica/secao/bant',
    );
    expect(cliente.enviar).toHaveBeenCalledWith('O que é BANT?', []);
  });

  it('Escape fecha o painel e devolve o foco ao gatilho; o histórico é preservado', async () => {
    const cliente = clienteFalso(sucesso);
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria(), clienteChat: cliente });
    const usuario = userEvent.setup();
    const gatilho = screen.getByRole('button', { name: 'Abrir assistente' });
    expect(gatilho.getAttribute('aria-expanded')).toBe('false');
    await usuario.click(gatilho);
    expect(screen.getByRole('button', { name: 'Fechar assistente' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Abrir assistente' })).toBeNull();
    await usuario.type(screen.getByLabelText('Pergunta ao assistente'), 'O que é BANT?');
    await usuario.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => expect(screen.getByText('Resposta com base no conteúdo.', { exact: false })).toBeTruthy());

    await usuario.keyboard('{Escape}');
    expect(screen.queryByLabelText('Pergunta ao assistente')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir assistente' }));

    await usuario.click(screen.getByRole('button', { name: 'Abrir assistente' }));
    expect(screen.getByText('Resposta com base no conteúdo.', { exact: false })).toBeTruthy();
  });

  it('o botão com ícone fecha o painel e devolve o foco ao gatilho', async () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria(), clienteChat: clienteFalso() });
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Abrir assistente' }));
    await usuario.click(screen.getByRole('button', { name: 'Fechar assistente' }));
    expect(screen.queryByLabelText('Pergunta ao assistente')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Abrir assistente' }));
  });

  it('sem serviço configurado, informa a indisponibilidade', async () => {
    renderizar('/', { armazenamento: new ArmazenamentoEmMemoria(), clienteChat: null });
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole('button', { name: 'Abrir assistente' }));
    await usuario.type(screen.getByLabelText('Pergunta ao assistente'), 'Oi');
    await usuario.click(screen.getByRole('button', { name: 'Enviar' }));
    expect(screen.getByRole('alert').textContent).toContain('não está configurado');
  });

  it('permite no máximo uma requisição em voo', async () => {
    let resolver: (resultado: ResultadoChat) => void = () => undefined;
    const enviar = vi.fn(
      () =>
        new Promise<ResultadoChat>((resolve) => {
          resolver = resolve;
        }),
    );
    const { result } = renderHook(() => useChat({ enviar, saude: vi.fn() }, TRILHA));
    await act(async () => {
      void result.current.enviar('primeira');
      void result.current.enviar('segunda');
    });
    expect(enviar).toHaveBeenCalledTimes(1);
    await act(async () => resolver(sucesso));
    expect(result.current.enviando).toBe(false);
  });

  it('repõe a pergunta após falha recuperável e envia sem duplicar a mensagem', async () => {
    const cliente = clienteFalso({ ok: false, erro: erroChat('PROVEDOR_INDISPONIVEL') }, sucesso);
    const { result } = renderHook(() => useChat(cliente, TRILHA));
    await act(async () => result.current.enviar('bant'));
    expect(result.current.erro?.recuperavel).toBe(true);
    await act(async () => result.current.tentarNovamente());
    expect(cliente.enviar).toHaveBeenNthCalledWith(2, 'bant', []);
    expect(result.current.mensagens.map((m) => m.papel)).toEqual(['arquiteto', 'assistente']);
    expect(result.current.erro).toBeNull();
    expect(result.current.sugestoes.map((s) => s.idModulo)).toContain('entrevista-tecnica');
  });

  it('rejeita mensagem vazia e acima do limite sem chamar o serviço', async () => {
    const cliente = clienteFalso();
    const { result } = renderHook(() => useChat(cliente, TRILHA));
    await act(async () => result.current.enviar('   '));
    expect(result.current.erro?.codigo).toBe('MENSAGEM_VAZIA');
    await act(async () => result.current.enviar('x'.repeat(1001)));
    expect(result.current.erro?.codigo).toBe('MENSAGEM_MUITO_LONGA');
    expect(cliente.enviar).not.toHaveBeenCalled();
  });
});

describe('acessibilidade (axe-core)', () => {
  async function auditar(container: HTMLElement): Promise<string[]> {
    // jsdom não calcula estilos: contraste é coberto por estilos.test.ts.
    const resultado = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    return resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
  }

  it.each([
    '/',
    '/trilha',
    '/trilha/entrevista-tecnica',
    '/trilha/entrevista-tecnica/secao/banco-de-perguntas',
    '/triagem',
    '/busca',
    '/glossario',
    '/referencias',
    '/pendencias',
    '/nao-existe',
  ])('%s não tem violações', async (rota) => {
    const { container } = renderizar(rota, { armazenamento: new ArmazenamentoEmMemoria() });
    expect(await auditar(container)).toEqual([]);
  });

  it.each([
    's-texto',
    's-lista',
    's-passos',
    's-comparativa',
    's-checklist',
    's-banco',
    's-referencias',
    's-formula',
    's-prompt',
    's-pendente',
  ])('seção %s não tem violações', async (secao) => {
    const { container } = renderizar(`/trilha/visao-da-area/secao/${secao}`, {
      armazenamento: new ArmazenamentoEmMemoria(),
      trilha: TRILHA_EXEMPLO,
    });
    expect(await auditar(container)).toEqual([]);
  });

  it('checklist somente leitura não tem violações', async () => {
    const { container } = renderizar('/trilha/visao-da-area/secao/s-checklist', {
      armazenamento: null,
      trilha: TRILHA_EXEMPLO,
    });
    expect(await auditar(container)).toEqual([]);
  });

  it('chat aberto não tem violações', async () => {
    const { container } = renderizar('/', { armazenamento: new ArmazenamentoEmMemoria() });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Abrir assistente' }));
    expect(await auditar(container)).toEqual([]);
  });
});
