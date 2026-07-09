import { Skeleton } from "@/components/ui/skeleton";

export function NewsListSkeleton() {
  return (
    <div className="space-y-7">
      {/* Hero slider */}
      <section>
        <Skeleton className="h-[210px] w-full rounded-[20px] bg-gray-200" />
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          ))}
        </div>
      </section>

      {/* Recentes */}
      <section>
        <Skeleton className="h-5 w-28 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-48 mb-3 bg-gray-100" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-shrink-0 w-[220px] rounded-[16px] border border-gray-100 overflow-hidden">
              <Skeleton className="h-[130px] w-full bg-gray-200" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-16 bg-gray-100" />
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-3 w-full bg-gray-100" />
                <Skeleton className="h-3 w-4/5 bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista vertical após Recentes */}
      <section className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-[16px] bg-gray-100" />
        ))}
      </section>

      {/* Category sections — layouts variados */}
      <section>
        <Skeleton className="h-5 w-24 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-52 mb-3 bg-gray-100" />
        <Skeleton className="h-[200px] w-full rounded-[16px] bg-gray-200 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
          <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-20 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-48 mb-3 bg-gray-100" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
          <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
          <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-16 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-44 mb-3 bg-gray-100" />
        <Skeleton className="h-[200px] w-full rounded-[16px] bg-gray-200 mb-3" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[220px] w-[220px] flex-shrink-0 rounded-[16px] bg-gray-100" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="mb-2 space-y-1">
        <Skeleton className="h-5 w-24 bg-gray-200" />
        <Skeleton className="h-4 w-52 bg-gray-100" />
      </div>
      <Skeleton className="h-[72px] w-full rounded-[16px] bg-gray-100" />
      <Skeleton className="h-[260px] w-full rounded-[16px] bg-gray-200" />
      <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
      <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
      <Skeleton className="h-20 w-full rounded-[16px] bg-gray-100" />
    </div>
  );
}

export function NewsDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
        <Skeleton className="h-5 w-16 bg-gray-200" />
        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
      </div>
      <Skeleton className="w-full h-56 bg-gray-200" />
      <div className="px-4 py-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full bg-gray-200" />
          <Skeleton className="h-6 w-4/5 bg-gray-200" />
          <Skeleton className="h-6 w-2/3 bg-gray-200" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24 bg-gray-100" />
          <Skeleton className="h-4 w-20 bg-gray-100" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-100" />
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-100" />
        </div>
        <AiSummarySkeleton />
        <div className="space-y-2 pt-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full bg-gray-100" />
          ))}
          <Skeleton className="h-4 w-5/6 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function AiSummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
      <Skeleton className="h-4 w-32 bg-gray-200" />
      <Skeleton className="h-3 w-full bg-gray-100" />
      <Skeleton className="h-3 w-full bg-gray-100" />
      <Skeleton className="h-3 w-4/5 bg-gray-100" />
      <Skeleton className="h-3 w-3/5 bg-gray-100" />
    </div>
  );
}

export function JornaisGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-[20px] border border-gray-100 overflow-hidden">
          <Skeleton className="h-52 w-full bg-gray-200" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-3 w-24 bg-gray-100" />
            <Skeleton className="h-5 w-full bg-gray-200" />
            <Skeleton className="h-5 w-4/5 bg-gray-200" />
            <Skeleton className="h-10 w-full rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-3">
          <Skeleton className="h-5 w-40 bg-gray-200" />
          <Skeleton className="h-4 w-56 bg-gray-100" />
          <Skeleton className="h-10 w-full bg-gray-100" />
          <Skeleton className="h-10 w-full bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export function ProfileListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}
