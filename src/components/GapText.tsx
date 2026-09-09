import type { DraftResult } from '../types/contract';
import { segments } from '../lib/draft';

/**
 * THE SEAM — the most important few lines of UI in the product.
 *
 * CONTEXT.md §4: "Every output has a visible seam showing what came from the
 * founder versus what was estimated." A highlight that is only a colour fails
 * a colourblind judge and a screen-reader user, so each flagged span also gets
 * a dotted underline, a ⚑ glyph, and off-screen text naming the source.
 */
export default function GapText({ section }: { section: DraftResult['sections'][number] }) {
  return (
    <p>
      {segments(section).map((s, i) =>
        s.gap ? (
          <mark className="gap" key={i} title={s.gap.note}>
            {s.text}
            <span className="sr-only"> — flagged: {s.gap.note} </span>
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}
