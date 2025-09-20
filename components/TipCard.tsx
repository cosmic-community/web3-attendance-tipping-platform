import type { TipCardProps } from '@/types'

export default function TipCard({ tip }: TipCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-badge status-confirmed'
      case 'pending':
        return 'status-badge status-pending'
      case 'failed':
        return 'status-badge status-failed'
      default:
        return 'status-badge status-pending'
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">💰 {tip.metadata.amount_eth} ETH Tip</h3>
            <span className={getStatusBadgeClass(tip.metadata.status.value)}>
              {tip.metadata.status.value}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Sent on {formatDate(tip.metadata.tip_date)}
          </p>
        </div>
        
        {tip.metadata.gas_fee_eth && (
          <div className="text-right">
            <label className="label text-xs text-slate-400">Gas Fee</label>
            <div className="text-sm">{tip.metadata.gas_fee_eth} ETH</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="label text-xs text-slate-400">From</label>
          <div className="eth-address bg-slate-800 rounded px-2 py-1 break-all">
            {tip.metadata.sender_address}
          </div>
        </div>
        <div>
          <label className="label text-xs text-slate-400">To</label>
          <div className="eth-address bg-slate-800 rounded px-2 py-1 break-all">
            {tip.metadata.recipient_address}
          </div>
        </div>
      </div>

      {/* Related Session */}
      {tip.metadata.related_session && (
        <div className="mb-4">
          <label className="label text-xs text-slate-400">Related Session</label>
          <div className="bg-slate-800 rounded px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{tip.metadata.related_session.title}</span>
              <span className="text-xs text-slate-400">
                {formatDate(tip.metadata.related_session.metadata.session_date)}
              </span>
            </div>
            {tip.metadata.related_session.metadata.description && (
              <p className="text-xs text-slate-400 mt-1">
                {tip.metadata.related_session.metadata.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      <div>
        <label className="label text-xs text-slate-400">Transaction Hash</label>
        <div className="tx-hash bg-slate-800 rounded px-2 py-1 break-all">
          {tip.metadata.transaction_hash}
        </div>
      </div>
    </div>
  )
}