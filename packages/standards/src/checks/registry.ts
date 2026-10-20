// Registro das checagens do Verificador_de_Padroes (tarefa 14.2).
import type { NamedCheck } from '../core/types.ts';
import { adrOnConstitutionChangeCheck } from './adr-on-constitution-change-check.ts';
import { claudeParityCheck } from './claude-parity-check.ts';
import { constitutionCheck } from './constitution-check.ts';
import { epicLinkCheck } from './epic-link-check.ts';
import { hookParityCheck } from './hook-parity-check.ts';
import { legacyListsCheck } from './legacy-lists-check.ts';
import { monorepoLayoutCheck } from './monorepo-layout-check.ts';
import { specStructureCheck } from './spec-structure-check.ts';
import { steeringHeaderCheck } from './steering-header-check.ts';
import { steeringLayoutCheck } from './steering-layout-check.ts';
import { steeringScopeCheck } from './steering-scope-check.ts';
import { tasksGraphCheck } from './tasks-graph-check.ts';

export const ALL_CHECKS: readonly NamedCheck[] = [
  constitutionCheck,
  steeringHeaderCheck,
  steeringLayoutCheck,
  steeringScopeCheck,
  claudeParityCheck,
  hookParityCheck,
  specStructureCheck,
  epicLinkCheck,
  tasksGraphCheck,
  monorepoLayoutCheck,
  adrOnConstitutionChangeCheck,
  legacyListsCheck,
];
