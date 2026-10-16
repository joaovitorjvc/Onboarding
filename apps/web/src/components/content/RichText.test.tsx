import fc from 'fast-check';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { RichText as RichTextValue } from '@nuagehub/contracts';
import { RichText } from './RichText';

describe('RichText', () => {
  // Feature: legacy-migration, Property 6: Texto rico nunca vira HTML
  it('preserva texto literal sem criar marcação arbitrária', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 1, maxLength: 8 }), (texts) => {
        const value = texts.map((text) => ({ text })) as RichTextValue;
        const { container } = render(<RichText value={value} />);
        expect(container.textContent).toBe(texts.join(''));
        expect(
          Array.from(container.querySelectorAll('*')).every((element) =>
            ['SPAN', 'STRONG', 'EM', 'A', 'SVG'].includes(element.tagName),
          ),
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
