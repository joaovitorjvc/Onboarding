import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

export interface SpecDir {
  name: string;
  files: string[];
  estimateHours: number | null;
  kind: 'simple' | 'epic' | 'subfeature';
}

const ESTIMATE_PATTERN = /^\*\*Estimativa_de_Esforco:\*\*\s*(\d+)h/m;
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Extrai a estimativa somente do cabeçalho definido pela Spec. */
export function extractEstimate(markdown: string | undefined): number | null {
  if (markdown === undefined) return null;
  const match = ESTIMATE_PATTERN.exec(markdown);
  return match === null ? null : Number(match[1]);
}

/** Retorna os arquivos mínimos esperados para cada tipo de documento. */
export function expectedFiles(spec: Pick<SpecDir, 'kind'>): string[] {
  if (spec.kind === 'epic') return ['epic-requirements.md', 'epic-design.md'];
  return ['requirements.md', 'design.md', 'tasks.md'];
}

function directDirectories(paths: readonly string[], parent: string): string[] {
  const prefix = `${parent}/`;
  const directories = new Set<string>();
  for (const path of paths) {
    if (!path.startsWith(prefix)) continue;
    const remainder = path.slice(prefix.length);
    const slash = remainder.indexOf('/');
    if (slash > 0) directories.add(remainder.slice(0, slash));
  }
  return [...directories].sort();
}

function filesUnder(paths: readonly string[], directory: string): string[] {
  const prefix = `${directory}/`;
  return paths.filter((path) => path.startsWith(prefix)).map((path) => path.slice(prefix.length));
}

function missingFiles(specPath: string, files: readonly string[], required: readonly string[]): string[] {
  return required.filter((file) => !files.includes(file)).map((file) => `${specPath}/${file}`);
}

function structureMessage(specPath: string, estimate: number | null, missing: readonly string[]): string {
  const estimateLabel = estimate === null ? 'ausente' : `${estimate}h`;
  return `Spec ${specPath} (estimativa: ${estimateLabel}); arquivos ausentes: ${missing.join(', ')}`;
}

function addKebabViolation(violations: Violation[], path: string, name: string): void {
  if (!KEBAB_CASE_PATTERN.test(name)) {
    violations.push({
      file: path,
      requirement: '6.1',
      message: `o nome da Spec "${name}" não está em kebab-case`,
    });
  }
}

function addSubfeatureViolations(
  violations: Violation[],
  snap: RepoSnapshot,
  epicPath: string,
  subfeatureName: string,
): void {
  const subfeaturePath = `${epicPath}/${subfeatureName}`;
  const files = filesUnder(snap.paths, subfeaturePath);
  const estimate = extractEstimate(snap.files.get(`${subfeaturePath}/requirements.md`));
  addKebabViolation(violations, subfeaturePath, subfeatureName);
  if (estimate === null) {
    violations.push({
      file: `${subfeaturePath}/requirements.md`,
      requirement: '6.2',
      message: structureMessage(subfeaturePath, estimate, ['requirements.md com estimativa no cabeçalho']),
    });
  }
  const missing = missingFiles(subfeaturePath, files, expectedFiles({ kind: 'subfeature' }));
  if (missing.length > 0) {
    violations.push({
      file: subfeaturePath,
      requirement: '6.11',
      message: structureMessage(subfeaturePath, estimate, missing),
    });
  }
}

function checkTopLevelSpec(violations: Violation[], snap: RepoSnapshot, name: string): void {
  const specPath = `.kiro/specs/${name}`;
  const files = filesUnder(snap.paths, specPath);
  const requirementsPath = `${specPath}/requirements.md`;
  const epicRequirementsPath = `${specPath}/epic-requirements.md`;
  const estimateDocument = snap.files.get(requirementsPath) ?? snap.files.get(epicRequirementsPath);
  const estimate = extractEstimate(estimateDocument);

  addKebabViolation(violations, specPath, name);
  if (estimate === null) {
    violations.push({
      file: requirementsPath,
      requirement: '6.2',
      message: structureMessage(specPath, estimate, [
        'requirements.md ou epic-requirements.md com estimativa no cabeçalho',
      ]),
    });
    return;
  }

  if (estimate <= snap.config.specMaxHours) {
    const missing = missingFiles(specPath, files, expectedFiles({ kind: 'simple' }));
    if (missing.length > 0) {
      violations.push({
        file: specPath,
        requirement: '6.3',
        message: structureMessage(specPath, estimate, missing),
      });
    }
    return;
  }

  const missingEpicFiles = missingFiles(specPath, files, expectedFiles({ kind: 'epic' }));
  if (missingEpicFiles.length > 0) {
    violations.push({
      file: specPath,
      requirement: '6.4',
      message: structureMessage(specPath, estimate, missingEpicFiles),
    });
  }

  const subfeatures = directDirectories(snap.paths, specPath);
  if (subfeatures.length === 0) {
    violations.push({
      file: specPath,
      requirement: '6.11',
      message: structureMessage(specPath, estimate, [
        `${specPath}/{sub-funcionalidade}/requirements.md`,
        `${specPath}/{sub-funcionalidade}/design.md`,
        `${specPath}/{sub-funcionalidade}/tasks.md`,
      ]),
    });
    return;
  }
  for (const subfeature of subfeatures) addSubfeatureViolations(violations, snap, specPath, subfeature);
}

/** Valida nome, estimativa e formato simples/épico de cada Spec. */
export const specStructureCheck: NamedCheck = {
  name: 'spec-structure-check',
  run: (snap) => {
    const names = new Set<string>();
    const prefix = '.kiro/specs/';
    for (const path of snap.paths) {
      if (!path.startsWith(prefix)) continue;
      const remainder = path.slice(prefix.length);
      const name = remainder.split('/')[0] ?? '';
      if (name !== '') names.add(name);
    }
    const violations: Violation[] = [];
    for (const name of [...names].sort()) checkTopLevelSpec(violations, snap, name);
    return violations;
  },
};
