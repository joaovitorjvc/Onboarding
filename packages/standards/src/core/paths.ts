import picomatch from 'picomatch';

/** Normaliza para separador "/" e remove "./" inicial. */
export function toPosix(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

/** Cria um matcher para uma lista de globs (dotfiles incluídos). */
export function globMatcher(globs: readonly string[]): (path: string) => boolean {
  if (globs.length === 0) return () => false;
  const m = picomatch([...globs], { dot: true });
  return (path: string) => m(toPosix(path));
}

/** Verdadeiro se o caminho pertence ao Site_Legado (Req. 18.5). */
export function isLegacy(path: string, legacyPaths: readonly string[]): boolean {
  return globMatcher(legacyPaths)(path);
}
