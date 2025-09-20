'use client'

import { useState } from 'react'
import { markAttendanceOnChain } from '@/lib/contract'
import type { SessionCardProps, TransactionStatus } from '@/types'

export default function SessionCard({ session, onMarkAttendance, canMarkAttendance = true }: SessionCardProps) {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleMarkAttendance = async () => {
    if (!session.metadata.session_id) {
      alert('Session not yet active on blockchain')
      return
    }

    // Check if MetaMask is available
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is required to mark attendance')
      return
    }

    setTxStatus({ status: 'pending', message: 'Marking attendance...' })

    try {
      // Check if wallet is connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      if (accounts.length === 0) {
        throw new Error('Please connect your wallet first')
      }

      const result = await markAttendanceOnChain(session.metadata.session_id)
      
      setTxStatus({
        status: 'success',
        message: 'Attendance marked successfully!',
        hash: result.transactionHash
      })

      if (onMarkAttendance) {
        onMarkAttendance(session.metadata.session_id)
      }

      // Auto-clear success message
      setTimeout(() => {
        setTxStatus({ status: 'idle' })
      }, 3000)

    } catch (error: any) {
      console.error('Error marking attendance:', error)
      setTxStatus({
        status: 'error',
        message: error.message || 'Failed to mark attendance'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-badge status-active'
      case 'closed': return 'status-badge status-closed'
      case 'pending': return 'status-badge status-pending'
      default: return 'status-badge status-pending'
    }
  }

  const getTxStatusColor = () => {
    switch (txStatus.status) {
      case 'pending': return 'text-warning bg-warning/10'
      case 'success': return 'text-success bg-success/10'
      case 'error': return 'text-error bg-error/10'
      default: return ''
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">{session.title}</h3>
            <span className={getStatusColor(session.metadata.status.value)}>
              {session.metadata.status.value}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Created on {formatDate(session.metadata.session_date)}
          </p>
        </div>
        
        {session.metadata.session_id && (
          <div className="text-right">
            <label className="label text-xs text-slate-400">Session ID</label>
            <div className="text-sm font-mono">#{session.metadata.session_id}</div>
          </div>
        )}
      </div>

      {session.metadata.description && (
        <p className="text-sm text-slate-300 mb-4">
          {session.metadata.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="label text-xs text-slate-400">Creator</label>
          <div className="eth-address bg-slate-800 rounded px-2 py-1 break-all">
            {session.metadata.creator_address}
          </div>
        </div>
        
        {session.metadata.transaction_hash && (
          <div>
            <label className="label text-xs text-slate-400">TX Hash</label>
            <div className="tx-hash bg-slate-800 rounded px-2 py-1 break-all">
              {session.metadata.transaction_hash}
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Button */}
      {canMarkAttendance && session.metadata.status.value === 'Active' && (
        <div className="space-y-2">
          <button
            onClick={handleMarkAttendance}
            disabled={txStatus.status === 'pending'}
            className="btn-secondary w-full"
          >
            {txStatus.status === 'pending' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Marking...
              </>
            ) : (
              '✓ Mark Attendance'
            )}
          </button>

          {/* Transaction Status */}
          {txStatus.status !== 'idle' && (
            <div className={`p-2 rounded text-xs ${getTxStatusColor()}`}>
              <p>{txStatus.message}</p>
              {txStatus.hash && (
                <p className="mt-1 opacity-70">
                  TX: {txStatus.hash.slice(0, 8)}...{txStatus.hash.slice(-6)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {session.metadata.status.value === 'Closed' && (
        <div className="text-center py-2 text-sm text-slate-400">
          Session has ended
        </div>
      )}
    </div>
  )
}