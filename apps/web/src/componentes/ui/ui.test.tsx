import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TRILHA } from '../../conteudo/trilha';
import { registroVazio } from '../../dominio/progresso/esquema';
import { comModuloConcluido } from '../../dominio/progresso/calculo';
import {
  Barra,
  Botao,
  Cartao,
  Expansivel,
  Hexagono,
  Indicador,
  IndicadorProgresso,
  MarcacaoPendencia,
  Selo,
  ValorConteudo,
} from './index';

afterEach(cleanup);

describe('primitivos de UI', () => {
  it('Botao: primário e secundário, largura total e desabilitado nativo', () => {
    render(
      <>
        <Botao>Primário</Botao>
        <Botao variante="secundario" larguraTotal disabled>
          Secundário
        </Botao>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Primário' }).className).toBe('nuage-botao nuage-botao--primario');
    const secundario = screen.getByRole('button', { name: 'Secundário' }) as HTMLButtonElement;
    expect(secundario.className).toBe('nuage-botao nuage-botao--secundario nuage-botao--bloco');
    expect(secundario.disabled).toBe(true);
    expect(secundario.type).toBe('button');
  });

  it('Selo: quatro tons', () => {
    render(
      <>
        {(['neutro', 'informativo', 'pendencia', 'confirmado'] as const).map((tom) => (
          <Selo key={tom} variante={tom}>
            {tom}
          </Selo>
        ))}
      </>,
    );
    for (const tom of ['neutro', 'informativo', 'pendencia', 'confirmado']) {
      expect(screen.getByText(tom).className).toBe(`nuage-etiqueta nuage-etiqueta--${tom}`);
    }
  });

  it('Barra: progressbar acessível, nunca circular', () => {
    const { container } = render(<Barra valor={42} rotulo="Progresso" tom="invertido" />);
    const barra = screen.getByRole('progressbar', { name: 'Progresso' });
    expect(barra.getAttribute('aria-valuenow')).toBe('42');
    expect(barra.className).toContain('nuage-barra--invertida');
    expect((container.querySelector('.nuage-barra-preenchimento') as HTMLElement).style.width).toBe('42%');
  });

  it('Hexagono: decorativo por padrão, imagem com rótulo quando informativo', () => {
    render(
      <>
        <Hexagono>1</Hexagono>
        <Hexagono rotulo="Posição 2" tom="destaque" tamanho="3rem">
          2
        </Hexagono>
      </>,
    );
    expect(screen.getByText('1').getAttribute('aria-hidden')).toBe('true');
    const informativo = screen.getByRole('img', { name: 'Posição 2' });
    expect(informativo.className).toContain('nuage-hexagono');
    expect(informativo.className).toContain('nuage-marcador--destaque');
    expect(informativo.style.getPropertyValue('--nuage-hex-tamanho')).toBe('3rem');
  });

  it('Cartao: sobretítulo decorativo e título semântico', () => {
    render(
      <Cartao sobretitulo="Resumo" titulo="Título do cartão" nivel={3} tom="invertido">
        Conteúdo
      </Cartao>,
    );
    expect(screen.getByText('Resumo').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('heading', { level: 3, name: 'Título do cartão' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Título do cartão' }).className).toBe(
      'nuage-cartao nuage-cartao--invertido',
    );
  });

  it('Expansivel usa <details> nativo', () => {
    const { container } = render(<Expansivel titulo="Pilar">Corpo</Expansivel>);
    const detalhes = container.querySelector('details.nuage-expansivel');
    expect(detalhes).not.toBeNull();
    expect(detalhes?.querySelector('summary.nuage-expansivel-resumo')?.textContent).toBe('Pilar');
    expect(detalhes?.hasAttribute('open')).toBe(false);
  });

  it('Indicador: número grande, rótulo e detalhe em mono', () => {
    const { container } = render(<Indicador icone="trilha" valor="42%" rotulo="concluído" detalhe="de 11" />);
    expect(container.querySelector('.nuage-indicador__valor')?.textContent).toBe('42%');
    expect(container.querySelector('.nuage-indicador__rotulo')?.textContent).toBe('concluído');
    expect(container.querySelector('.nuage-indicador__detalhe')?.textContent).toBe('de 11');
    expect(container.querySelector('.nuage-moldura-icone svg[aria-hidden="true"]')).not.toBeNull();
  });

  it('IndicadorProgresso: 11 segmentos inclinados e estado por Módulo', () => {
    const registro = comModuloConcluido(registroVazio('x'), 'visao-da-area', true, 'x');
    const { container } = render(<IndicadorProgresso trilha={TRILHA} registro={registro} />);
    const segmentos = container.querySelectorAll('li.nuage-paralelogramo.nuage-segmento');
    expect(segmentos).toHaveLength(11);
    expect(container.querySelectorAll('.nuage-segmento--concluido')).toHaveLength(1);
    expect(screen.getByText('Módulo 1, Visão da área: concluído')).toBeTruthy();
  });

  it('ValorConteudo: confirmado exibe valor e origem; pendente exibe só a marcação', () => {
    render(
      <>
        <ValorConteudo
          conteudo={{
            estado: 'confirmado',
            valor: 'Valor confirmado',
            origem: { tipo: 'confirmacao-gestor', referencia: 'ref-1' },
          }}
        >
          {(valor) => <p>{valor}</p>}
        </ValorConteudo>
        <ValorConteudo<string>
          conteudo={{ estado: 'pendente', pendencia: { id: 'p', descricao: 'Aguardando', requisito: 'Confirmar' } }}
        >
          {(valor) => <p>{valor}</p>}
        </ValorConteudo>
      </>,
    );
    expect(screen.getByText('Valor confirmado')).toBeTruthy();
    expect(screen.getByText('ref-1').className).toBe('nuage-origem__referencia');
    expect(screen.getByText('Aguardando')).toBeTruthy();
    expect(screen.getAllByText('Pendente')).toHaveLength(1);
  });

  it('MarcacaoPendencia mostra descrição e requisito', () => {
    render(<MarcacaoPendencia descricao="Texto pendente" requisito="Confirmar com o Gestor" />);
    expect(screen.getByText('Requisito: Confirmar com o Gestor')).toBeTruthy();
  });
});
