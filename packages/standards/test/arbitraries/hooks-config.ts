import fc from 'fast-check';

export const hookScriptArbitrary = fc.constantFrom('pre-write-security', 'post-task-validation', 'outro-hook');

export const hookSetArbitrary = fc.uniqueArray(hookScriptArbitrary, { maxLength: 3 });

export function kiroSettings(scripts: readonly string[]): Record<string, unknown> {
  const commands = scripts.map((script) => ({ command: `scripts/hooks/${script}` }));
  return {
    hooks: {
      preToolUse: [
        { matcher: 'write', command: 'scripts/hooks/pre-write-security' },
        ...commands.filter((entry) => !entry.command.endsWith('/pre-write-security')),
      ],
      stop: [
        { command: 'scripts/hooks/post-task-validation' },
        ...commands.filter((entry) => !entry.command.endsWith('/post-task-validation')),
      ],
    },
  };
}

export function claudeSettings(scripts: readonly string[]): Record<string, unknown> {
  const commands = scripts.map((script) => ({ type: 'command', command: `scripts/hooks/${script}` }));
  return {
    hooks: {
      PreToolUse: [
        {
          matcher: 'Write|Edit|MultiEdit',
          hooks: [
            { type: 'command', command: '"$CLAUDE_PROJECT_DIR"/scripts/hooks/pre-write-security' },
            ...commands.filter((entry) => !entry.command.endsWith('/pre-write-security')),
          ],
        },
      ],
      Stop: [
        {
          hooks: [
            { type: 'command', command: '"$CLAUDE_PROJECT_DIR"/scripts/hooks/post-task-validation' },
            ...commands.filter((entry) => !entry.command.endsWith('/post-task-validation')),
          ],
        },
      ],
    },
  };
}
