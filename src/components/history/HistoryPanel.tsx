'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchHistory } from '@/lib/api'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import DepositCard from './DepositCard'
import SkeletonCard from './SkeletonCard'

type HistoryResponse = Awaited<ReturnType<typeof fetchHistory>>

export default function HistoryPanel() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<HistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchHistory(p)
      setData(res)
      setPage(res.page)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(0) }, [load])

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Deposit History</h2>
        <button onClick={() => load(page)} className="btn-ghost py-1.5 px-3 text-xs">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card-sm p-4 text-xs text-red-400 border-red-500/20">{error}</div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data?.deposits.length === 0 && (
        <div className="card-sm p-12 text-center">
          <p className="text-2xl mb-3">📭</p>
          <p className="text-sm text-zinc-500">No deposits yet.</p>
          <p className="text-xs text-zinc-600 mt-1">Use the Deposit tab to get started.</p>
        </div>
      )}

      {/* Deposit list */}
      {!loading && data && data.deposits.length > 0 && (
        <>
          <p className="text-xs text-zinc-600">
            {data.total} deposit{data.total !== 1 ? 's' : ''} total
          </p>

          <div className="space-y-2">
            {data.deposits.map((dep: any, i: number) => (
              <DepositCard key={dep.id} dep={dep} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => load(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-ghost p-2 disabled:opacity-30"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs text-zinc-500 px-2">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => load(page + 1)}
                disabled={!data.hasMore}
                className="btn-ghost p-2 disabled:opacity-30"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  )
}
