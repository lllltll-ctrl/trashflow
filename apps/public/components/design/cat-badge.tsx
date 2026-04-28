import { WASTE_CATEGORY_LABELS_UA, type WasteCategoryId } from '@trashflow/db';
import { categoryStyle } from './tokens';

export function CatBadge({ id }: { id: WasteCategoryId }) {
  const s = categoryStyle[id];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full py-[4px] pl-[8px] pr-[10px] text-[11.5px] font-semibold tracking-[-0.01em]"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        aria-hidden
        className="inline-block size-[8px] rounded-full"
        style={{ background: s.color }}
      />
      {WASTE_CATEGORY_LABELS_UA[id]}
    </span>
  );
}
