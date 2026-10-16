// Tipos centrais do Verificador_de_Padroes (design §4).

/** Configuração lida de standards.config.json. */
export interface StandardsConfig {
  legacyPaths: string[];
  stacks: { web: string; api: string; ai: string; packages: string };
  specMaxHours: number;
  taskMaxHours: number;
}

/** Violação de padrão: arquivo, requisito da Spec (ex.: "2.6") e mensagem em pt-BR. */
export interface Violation {
  file: string;
  requirement: string;
  message: string;
}

/** Fotografia imutável dos arquivos relevantes do Repositório. */
export interface RepoSnapshot {
  /** Caminho relativo à raiz (separador "/") → conteúdo. */
  files: ReadonlyMap<string, string>;
  /** Todos os caminhos versionados ou não rastreados (sem ignorados), inclusive os não carregados em `files`. */
  paths: readonly string[];
  config: StandardsConfig;
  /** Arquivos alterados no PR (modo CI, opção --changed-files). Ausente localmente. */
  changedFiles?: readonly string[];
}

/** Checagem pura sobre o snapshot. */
export type Check = (snap: RepoSnapshot) => Violation[];

export interface NamedCheck {
  name: string;
  run: Check;
}

export const DEFAULT_CONFIG: StandardsConfig = {
  legacyPaths: ['index.html', 'primeiros-passos.html', 'plataformas.html', 'playbook.html', 'css/**', 'js/**'],
  stacks: { web: 'apps/web/**', api: 'apps/api/**', ai: 'services/ai/*/**', packages: 'packages/**' },
  specMaxHours: 80,
  taskMaxHours: 8,
};
