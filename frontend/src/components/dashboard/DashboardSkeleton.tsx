export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="h-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
