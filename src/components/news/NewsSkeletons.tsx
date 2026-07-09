import { Skeleton } from "@/components/ui/skeleton";

export function NewsListSkeleton() {
  return (
    <div className="space-y-7">
      {/* Destaques skeleton */}
      <section>
        <Skeleton className="h-5 w-28 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-48 mb-3 bg-gray-100" />
        <Skeleton className="h-[210px] w-full rounded-[20px] bg-gray-200" />
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-1.5 w-1.5 rounded-full bg-gray-200" />
          ))}
        </div>
      </section>

      {/* Recentes skeleton */}
      <section>
        <Skeleton className="h-5 w-24 mb-1 bg-gray-200" />
        <Skeleton className="h-4 w-56 mb-3 bg-gray-100" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[120px] w-[148px] rounded-[16px] flex-shrink-0 bg-gray-200" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function NewsDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
        <Skeleton className="h-5 w-16 bg-gray-200" />
        <Skeleton className="h-6 w-6 rounded bg-gray-200" />
      </div>

      {/* Image */}
      <Skeleton className="w-full h-56 bg-gray-200" />

      <div className="px-4 py-5 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full bg-gray-200" />
          <Skeleton className="h-6 w-4/5 bg-gray-200" />
        </div>

        {/* Meta */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24 bg-gray-100" />
          <Skeleton className="h-4 w-20 bg-gray-100" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-100" />
          <Skeleton className="h-11 flex-1 rounded-xl bg-gray-100" />
        </div>

        {/* AI summary */}
        <Skeleton className="h-28 w-full rounded-xl bg-gray-100" />

        {/* Body */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full bg-gray-100" />
          <Skeleton className="h-4 w-full bg-gray-100" />
          <Skeleton className="h-4 w-5/6 bg-gray-100" />
          <Skeleton className="h-4 w-full bg-gray-100" />
          <Skeleton className="h-4 w-4/6 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function AiSummarySkeleton() {
  return (
    <div className="rounded-xl border border-[#2B58C5]/20 bg-[#2B58C5]/5 p-4 space-y-2">
      <Skeleton className="h-4 w-32 bg-[#2B58C5]/15" />
      <Skeleton className="h-3 w-full bg-[#2B58C5]/10" />
      <Skeleton className="h-3 w-full bg-[#2B58C5]/10" />
      <Skeleton className="h-3 w-3/4 bg-[#2B58C5]/10" />
    </div>
  );
}
