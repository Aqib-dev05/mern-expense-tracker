import { categoryMeta } from '../constants/index.js';

/** Emoji tile tinted with the category colour. */
export default function CategoryIcon({ category, size = 'md' }) {
  const { emoji, color } = categoryMeta(category);
  const dim = size === 'sm' ? 'h-8 w-8 text-base' : size === 'lg' ? 'h-12 w-12 text-2xl' : 'h-10 w-10 text-xl';
  return (
    <span
      className={`${dim} flex shrink-0 items-center justify-center rounded-xl`}
      style={{ backgroundColor: `${color}22` }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
