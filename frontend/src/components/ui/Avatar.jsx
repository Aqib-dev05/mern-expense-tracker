export default function Avatar({ user, size = 'md' }) {
  const dim = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-20 w-20 text-2xl' }[size];
  if (user?.avatar) return <img src={user.avatar} alt="" className={`${dim} rounded-full object-cover`} />;
  const initials = (user?.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={`${dim} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200`}>
      {initials}
    </span>
  );
}
