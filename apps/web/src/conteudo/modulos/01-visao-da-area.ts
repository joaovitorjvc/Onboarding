import type { Secao } from '../../dominio/conteudo/tipos.ts';
import { confirmado, criarModulo } from '../apoio.ts';

const escopoDeAtuacao: Secao = {
  tipo: 'topicos',
  id: 'escopo-de-atuacao',
  titulo: 'Escopo de atuação da área',
  conteudo: confirmado(
    [
      {
        titulo: 'Objetivo da área',
        paragrafos: [
          'A área de Soluções tem como objetivo compreender os desafios tecnológicos e as necessidades de negócio dos clientes, conectando essas demandas às capacidades da NuageIT. Sua atuação busca identificar oportunidades de melhoria, apoiar a definição de estratégias tecnológicas e contribuir para a construção de soluções alinhadas aos objetivos de cada organização.',
        ],
      },
      {
        titulo: 'Responsabilidades da área',
        paragrafos: [
          'Entre as principais responsabilidades estão compreender o cenário e as necessidades dos clientes, avaliar desafios técnicos, identificar oportunidades de melhoria e apoiar a definição de soluções adequadas a cada contexto. A área também pode contribuir para a elaboração de propostas técnicas, o alinhamento de expectativas e a avaliação da viabilidade das soluções, em conjunto com as equipes envolvidas.',
        ],
      },
      {
        titulo: 'Integração com a equipe de SDR',
        paragrafos: [
          'A área de Soluções contribui para o processo comercial ao apoiar o entendimento das necessidades dos potenciais clientes e a identificação de oportunidades compatíveis com as capacidades da empresa.',
          'Para o SDR, compreender a atuação dessa área é importante para conduzir conversas mais consultivas, elaborar perguntas de qualificação relevantes e reconhecer situações em que o apoio de especialistas pode agregar valor à oportunidade. As informações coletadas durante a prospecção ajudam a equipe comercial a compreender o contexto do prospect e a dar continuidade ao processo de vendas.',
        ],
      },
      {
        titulo: 'Resultado esperado',
        paragrafos: [
          'A integração entre a área de Soluções e a equipe de pré-vendas busca melhorar a qualidade das oportunidades identificadas, facilitar a comunicação entre as equipes e aproximar as necessidades dos clientes das capacidades da NuageIT.',
          'Ao concluir este módulo, o futuro SDR deverá compreender o papel da área de Soluções, suas responsabilidades gerais e sua importância no processo comercial, reconhecendo como a colaboração entre as equipes contribui para uma prospecção mais estratégica e orientada à geração de valor.',
        ],
      },
    ],
    'Escopo de atuação da área',
  ),
};

const setePilares: Secao = {
  tipo: 'topicos',
  id: 'os-sete-pilares',
  titulo: 'Os sete Pilares',
  conteudo: confirmado(
    [
      {
        titulo: 'Objetivo do módulo',
        marcador: 'OBJ',
        largura: 'total',
        paragrafos: [
          'Apresentar aos novos SDRs os sete pilares de atuação da NuageIT, proporcionando uma compreensão inicial das áreas que compõem o portfólio da empresa. O conhecimento desses pilares ajuda a identificar oportunidades comerciais, compreender os desafios dos potenciais clientes e direcionar a prospecção de acordo com suas necessidades.',
        ],
      },
      {
        titulo: 'Cloud',
        marcador: '01',
        paragrafos: [
          'Representa a base da infraestrutura tecnológica em nuvem. Esse pilar envolve a estruturação de ambientes, a migração de sistemas, a governança e a gestão da infraestrutura, permitindo que as empresas utilizem recursos tecnológicos com segurança, flexibilidade e escalabilidade.',
        ],
      },
      {
        titulo: 'Security & Compliance',
        marcador: '02',
        paragrafos: [
          'Tem como foco a proteção dos ambientes tecnológicos e a redução de riscos relacionados à segurança da informação. Envolve práticas, ferramentas e estratégias para proteger dados, aplicações e infraestrutura, além de apoiar o atendimento a requisitos de conformidade.',
        ],
      },
      {
        titulo: 'FinOps',
        marcador: '03',
        paragrafos: [
          'Busca melhorar a gestão financeira dos ambientes em nuvem, oferecendo maior visibilidade sobre os gastos e identificando oportunidades de otimização. O objetivo é ajudar as empresas a controlar custos, utilizar recursos de maneira eficiente e alinhar investimentos tecnológicos aos resultados do negócio.',
        ],
      },
      {
        titulo: 'Cloud Native & Platform',
        marcador: '04',
        paragrafos: [
          'É voltado à modernização do desenvolvimento e da operação de aplicações. Abrange práticas de automação, integração e entrega contínua, plataformas modernas e tecnologias que ajudam as equipes a desenvolver, publicar e manter aplicações com mais agilidade e confiabilidade.',
        ],
      },
      {
        titulo: 'Data & Analytics',
        marcador: '05',
        paragrafos: [
          'Tem como objetivo transformar dados em informações úteis para a tomada de decisões. Esse pilar contempla a organização, integração, processamento e análise de dados, permitindo que as empresas identifiquem tendências, acompanhem indicadores e obtenham insights estratégicos.',
        ],
      },
      {
        titulo: 'GenAI — Inteligência Artificial Generativa',
        marcador: '06',
        paragrafos: [
          'Envolve a aplicação de inteligência artificial generativa para apoiar atividades, automatizar processos e ampliar a produtividade das equipes. Inclui iniciativas como assistentes inteligentes, agentes de IA e soluções capazes de utilizar informações corporativas para apoiar tarefas e decisões.',
        ],
      },
      {
        titulo: 'Digital Product',
        marcador: '07',
        paragrafos: [
          'Abrange a criação, evolução e modernização de produtos e aplicações digitais. O foco é desenvolver soluções alinhadas às necessidades dos negócios, utilizando práticas de engenharia de software, APIs, microsserviços e equipes especializadas para apoiar a evolução dos produtos.',
        ],
      },
      {
        titulo: 'A importância dos pilares para o SDR',
        marcador: 'SDR',
        largura: 'total',
        paragrafos: [
          'Conhecer os sete pilares permite ao SDR compreender melhor o portfólio da NuageIT e relacionar os desafios identificados durante a prospecção às possíveis frentes de atuação da empresa.',
          'O objetivo não é que o SDR domine os detalhes técnicos de cada pilar, mas que consiga reconhecer necessidades, formular perguntas relevantes e identificar quando uma oportunidade merece ser aprofundada pelo time comercial e pelos especialistas.',
          'Ao concluir este módulo, o futuro SDR deverá reconhecer os sete pilares, compreender seus objetivos gerais e utilizar esse conhecimento como base para uma prospecção mais consultiva e orientada às necessidades dos clientes.',
        ],
      },
    ],
    'Os sete Pilares',
  ),
};

const papeisDoProcesso: Secao = {
  tipo: 'topicos',
  id: 'papeis-do-processo',
  titulo: 'Papéis do processo',
  conteudo: confirmado(
    [
      {
        titulo: 'Objetivo do módulo',
        marcador: 'OBJ',
        paragrafos: [
          'Apresentar as responsabilidades de Marketing, SDR e AM no processo comercial, garantindo que cada profissional compreenda seu papel na geração de leads, na prospecção e no agendamento de reuniões com potenciais clientes.',
        ],
      },
      {
        titulo: 'Marketing — Geração e Enriquecimento de Leads',
        marcador: '01',
        paragrafos: [
          'O Marketing é responsável por gerar as listas de leads que serão trabalhadas pela equipe de SDRs. Esse processo envolve pesquisar empresas e contatos, enriquecer as informações disponíveis e organizar os dados conforme o perfil de cliente definido pela estratégia comercial.',
        ],
        itens: {
          rotulo: 'Principais responsabilidades',
          itens: [
            'Pesquisar e identificar empresas e contatos potenciais.',
            'Enriquecer as listas com informações relevantes para a prospecção.',
            'Organizar e disponibilizar as listas para os SDRs.',
            'Buscar qualidade e consistência nos dados fornecidos.',
          ],
        },
      },
      {
        titulo: 'SDR — Prospecção e Agendamento',
        marcador: '02',
        paragrafos: [
          'O SDR é responsável por trabalhar a lista disponibilizada pelo Marketing, entrar em contato com os potenciais clientes, identificar oportunidades e despertar interesse nas soluções da empresa. Quando identifica um lead com potencial, seu objetivo é agendar uma reunião com o AM para aprofundar a conversa comercial.',
        ],
        itens: {
          rotulo: 'Principais responsabilidades',
          itens: [
            'Analisar e trabalhar as listas de leads recebidas.',
            'Realizar contatos por telefone, e-mail, LinkedIn e outros canais utilizados pela empresa.',
            'Identificar necessidades, desafios e oportunidades iniciais.',
            'Qualificar os leads de acordo com os critérios comerciais.',
            'Agendar reuniões entre os leads qualificados e o AM.',
            'Registrar os contatos, as interações e os resultados da prospecção.',
          ],
        },
      },
      {
        titulo: 'AM — Condução da Reunião Comercial',
        marcador: '03',
        paragrafos: [
          'O AM (Account Manager) é responsável por conduzir a reunião agendada pelo SDR, aprofundar o entendimento sobre as necessidades do potencial cliente e avaliar possibilidades de negócio. A partir dessa conversa, o AM define os próximos passos comerciais e conduz o relacionamento conforme a oportunidade identificada.',
        ],
        itens: {
          rotulo: 'Principais responsabilidades',
          itens: [
            'Receber o contexto e as informações levantadas pelo SDR.',
            'Conduzir a reunião com o potencial cliente.',
            'Aprofundar o entendimento dos desafios e objetivos do prospect.',
            'Avaliar a aderência das necessidades às soluções da empresa.',
            'Definir os próximos passos e dar continuidade à oportunidade comercial.',
          ],
        },
      },
      {
        titulo: 'Fluxo do Processo',
        marcador: '04',
        paragrafos: [
          'O processo começa com o Marketing, que gera e enriquece as listas de leads. Em seguida, o SDR utiliza essas informações para prospectar, estabelecer contato e qualificar potenciais clientes. Quando há interesse e aderência aos critérios definidos, o SDR agenda uma reunião com o AM, que assume a condução da conversa comercial e avalia as possibilidades de negócio.',
        ],
      },
      {
        titulo: 'Resultado esperado',
        marcador: 'RES',
        paragrafos: [
          'Garantir um fluxo organizado entre geração de leads, prospecção e reuniões comerciais, permitindo que o Marketing forneça listas relevantes, que o SDR concentre esforços em contatos com potencial e que o AM receba oportunidades qualificadas para dar continuidade ao processo de vendas.',
        ],
      },
    ],
    'Papéis do processo',
  ),
};

const triagemDeEscopo: Secao = {
  tipo: 'topicos',
  id: 'triagem-de-escopo',
  titulo: 'Triagem de escopo',
  conteudo: confirmado(
    [
      {
        titulo: 'Objetivo do módulo',
        marcador: 'OBJ',
        paragrafos: [
          'Orientar o SDR na identificação e priorização de potenciais clientes, ajudando a avaliar se as empresas abordadas apresentam características e necessidades compatíveis com o perfil de atuação da NuageIT. A triagem permite direcionar os esforços de prospecção para oportunidades com maior potencial comercial.',
        ],
      },
      {
        titulo: 'Análise inicial da empresa',
        marcador: '01',
        paragrafos: [
          'Antes de iniciar o contato, o SDR deve pesquisar a empresa para compreender seu segmento, porte, estrutura tecnológica e contexto de negócio. Essas informações ajudam a identificar possíveis desafios e preparar uma abordagem mais personalizada.',
        ],
      },
      {
        titulo: 'Identificação de oportunidades',
        marcador: '02',
        paragrafos: [
          'Durante a pesquisa e o contato, o SDR deve buscar indícios de necessidades que possam ser atendidas pela empresa, como desafios tecnológicos, projetos de modernização, dificuldades operacionais ou objetivos de crescimento. O foco é identificar possíveis oportunidades, sem presumir que a empresa possui determinado problema antes de validá-lo com o contato.',
        ],
      },
      {
        titulo: 'Qualificação do lead',
        marcador: '03',
        paragrafos: [
          'Durante a conversa, o SDR deve investigar o cenário atual da empresa, suas prioridades e a relevância dos desafios identificados. Também deve verificar se está conversando com uma pessoa envolvida ou influente no tema e se existe abertura para aprofundar a discussão.',
        ],
      },
      {
        titulo: 'Critérios para avançar',
        marcador: '04',
        paragrafos: [
          'Uma oportunidade pode avançar para uma reunião com o AM quando houver aderência inicial ao perfil de cliente desejado, uma necessidade ou iniciativa relevante identificada e interesse do contato em conversar sobre o assunto. O SDR deve registrar as informações levantadas para que o AM tenha contexto antes da reunião.',
        ],
      },
      {
        titulo: 'Quando não avançar',
        marcador: '05',
        paragrafos: [
          'Se a empresa não apresentar aderência aparente ao perfil desejado, não houver uma oportunidade identificável ou o contato não demonstrar interesse, o SDR deve registrar o resultado e seguir a orientação comercial aplicável. A ausência de informações, por si só, não significa necessariamente que a empresa deva ser descartada.',
        ],
      },
      {
        titulo: 'Resultado esperado',
        marcador: 'RES',
        paragrafos: [
          'Ao concluir este módulo, o SDR deverá ser capaz de pesquisar empresas, identificar sinais de oportunidades, realizar uma qualificação inicial e decidir quando faz sentido propor uma reunião com o AM, contribuindo para um processo comercial mais organizado e eficiente.',
        ],
      },
    ],
    'Triagem de escopo',
  ),
};

const modulo = criarModulo('visao-da-area', 1, 'Visão da área', [
  escopoDeAtuacao,
  setePilares,
  papeisDoProcesso,
  triagemDeEscopo,
]);

export const moduloVisaoDaArea = {
  ...modulo,
  resumo: confirmado(
    'Apresenta a área de Soluções, suas principais responsabilidades e os serviços oferecidos pela empresa. O objetivo é preparar os futuros SDRs para compreender as soluções da NuageIT e identificar oportunidades comerciais alinhadas às necessidades dos clientes.',
    'Resumo do módulo Visão da área',
  ),
  origem: confirmado(
    'Conteúdo elaborado com base no posicionamento institucional e no portfólio de soluções da NuageIT, como parte do onboarding de novos SDRs.',
    'Origem do módulo Visão da área',
  ),
};
