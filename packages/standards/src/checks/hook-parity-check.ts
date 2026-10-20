import type { NamedCheck, RepoSnapshot, Violation } from '../core/types.ts';

interface HookEntry {
  matcher?: string;
  command?: string;
  hooks?: HookEntry[];
}

interface HookConfig {
  hooks?: Record<string, HookEntry[]>;
}

const SCRIPT_PATTERN = /(?:\$CLAUDE_PROJECT_DIR["']?\/)?scripts\/hooks\/([a-z0-9-]+)/gi;

function parseFile(snapshot: RepoSnapshot, path: string): HookConfig {
  const content = snapshot.files.get(path);
  if (!content) return {};
  return JSON.parse(content) as HookConfig;
}

function entries(config: HookConfig, name: string): HookEntry[] {
  return config.hooks?.[name] ?? [];
}

function commands(entry: HookEntry): string[] {
  return [entry.command ?? '', ...(entry.hooks ?? []).flatMap(commands)];
}

export function scriptsFromCommands(config: HookConfig): Set<string> {
  const scripts = new Set<string>();
  for (const hookEntries of Object.values(config.hooks ?? {})) {
    for (const entry of hookEntries) {
      for (const command of commands(entry)) {
        for (const match of command.matchAll(SCRIPT_PATTERN)) {
          if (match[1] !== 'conditional-steering') scripts.add(`scripts/hooks/${match[1]}`);
        }
      }
    }
  }
  return scripts;
}

function hasCommand(entriesToCheck: HookEntry[], script: string): boolean {
  return entriesToCheck.some((entry) => commands(entry).some((command) => command.includes(`scripts/hooks/${script}`)));
}

function difference(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((value) => !right.has(value)).sort();
}

export function checkHookParity(snapshot: RepoSnapshot): Violation[] {
  const kiro = parseFile(snapshot, '.kiro/agents/nuagehub.json');
  const claude = parseFile(snapshot, '.claude/settings.json');
  const violations: Violation[] = [];
  const kiroPre = entries(kiro, 'preToolUse');
  const claudePre = entries(claude, 'PreToolUse');
  const kiroStop = entries(kiro, 'stop');
  const claudeStop = entries(claude, 'Stop');

  if (!kiroPre.some((entry) => entry.matcher === 'write' && hasCommand([entry], 'pre-write-security'))) {
    violations.push({
      file: '.kiro/agents/nuagehub.json',
      requirement: '4.1',
      message: 'falta preToolUse com matcher write chamando pre-write-security',
    });
  }
  if (!claudePre.some((entry) => entry.matcher === 'Write|Edit|MultiEdit')) {
    violations.push({
      file: '.claude/settings.json',
      requirement: '4.2',
      message: 'falta PreToolUse com matcher Write|Edit|MultiEdit',
    });
  }
  if (!kiroStop.some((entry) => hasCommand([entry], 'post-task-validation'))) {
    violations.push({
      file: '.kiro/agents/nuagehub.json',
      requirement: '5.1',
      message: 'falta stop chamando post-task-validation',
    });
  }
  if (claudeStop.length === 0) {
    violations.push({ file: '.claude/settings.json', requirement: '5.2', message: 'falta o hook Stop' });
  }

  const kiroScripts = scriptsFromCommands(kiro);
  const claudeScripts = scriptsFromCommands(claude);
  const onlyKiro = difference(kiroScripts, claudeScripts);
  const onlyClaude = difference(claudeScripts, kiroScripts);
  if (onlyKiro.length > 0 || onlyClaude.length > 0) {
    const parts = [];
    if (onlyKiro.length > 0) parts.push(`somente no Kiro: ${onlyKiro.join(', ')}`);
    if (onlyClaude.length > 0) parts.push(`somente no Claude: ${onlyClaude.join(', ')}`);
    violations.push({
      file: '.kiro/agents/nuagehub.json',
      requirement: '5.10',
      message: `Scripts_de_Hook divergentes (${parts.join('; ')})`,
    });
  }
  return violations;
}

export const hookParityCheck: NamedCheck = {
  name: 'hookParityCheck',
  run: checkHookParity,
};
