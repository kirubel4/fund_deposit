'use client'

export default function SkeletonCard() {
  return (
    <div className="card-sm p-4 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3 w-36" />
        </div>
        <div className="skeleton h-4 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  )
}
