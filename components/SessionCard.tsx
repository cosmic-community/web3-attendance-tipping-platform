'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract, markAttendance } from '@/lib/contract'
import type { AttendanceSession, TransactionStatus } from '@/types'

interface SessionCardProps {
  session: AttendanceSession;
}

export default function SessionCard({ session }: SessionCardProps) {
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const handleMarkAttendance = async () => {
    if (!session.metadata.session_id) {
      setTxStatus({
        status: 'error',
        message: 'Session not yet active on blockchain'
      })
      return
    }

    if (!window.ethereum) {
      setTxStatus({
        status: 'error',
        message: 'MetaMask not detected'
      })
      return
    }

    setTxStatus({ status: 'pending', message: 'Marking attendance...' })

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = await getContract(signer)
      
      const tx = await markAttendance(contract, session.metadata.session_id)
      
      setTxStatus({ 
        status: 'pending', 
        message: 'Transaction submitted. Waiting for confirmation...',
        hash: tx.hash 
      })

      const receipt = await tx.wait()
      
      if (receipt) {
        setTxStatus({
          status: 'success',
          message: 'Attendance marked successfully!',
          hash: tx.hash
        })
      }
    } catch (error: any) {
      console.error('Error marking attendance:', error)
      let errorMessage = 'Failed to mark attendance'
      
      if (error.message.includes('already marked')) {
        errorMessage = 'You have already marked attendance for this session'
      } else if (error.message.includes('not active')) {
        errorMessage = 'This session is not currently active'
      }
      
      setTxStatus({
        status: 'error',
        message: errorMessage
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-badge status-active'
      case 'pending':
        return 'status-badge status-pending'
      case 'closed':
        return 'status-badge status-closed'
      default:
        return 'status-badge status-pending'
    }
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>📅 {formatDate(session.metadata.session_date)}</span>
            <span className={getStatusBadgeClass(session.metadata.status.value)}>
              {session.metadata.status.value}
            </span>
          </div>
        </div>
        
        {session.metadata.status.value === 'Active' && session.metadata.session_id && (
          <button
            onClick={handleMarkAttendance}
            disabled={txStatus.status === 'pending'}
            className="btn btn-primary"
          >
            {txStatus.status === 'pending' ? (
              <div className="flex items-center space-x-2">
                <div className="spinner"></div>
                <span>Marking...</span>
              </div>
            ) : (
              '✓ Mark Attendance'
            )}
          </button>
        )}
      </div>

      {session.metadata.description && (
        <p className="text-slate-300 mb-4">{session.metadata.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="label text-xs text-slate-400">Creator Address</label>
          <div className="eth-address bg-slate-800 rounded px-2 py-1 break-all">
            {session.metadata.creator_address}
          </div>
        </div>
        
        {session.metadata.session_id && (
          <div>
            <label className="label text-xs text-slate-400">Blockchain Session ID</label>
            <div className="text-sm bg-slate-800 rounded px-2 py-1">
              #{session.metadata.session_id}
            </div>
          </div>
        )}
      </div>

      {session.metadata.transaction_hash && (
        <div className="mt-4">
          <label className="label text-xs text-slate-400">Creation Transaction</label>
          <div className="tx-hash bg-slate-800 rounded px-2 py-1 break-all">
            {session.metadata.transaction_hash}
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {txStatus.status !== 'idle' && (
        <div className="mt-4">
          {txStatus.status === 'pending' && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="spinner"></div>
                <span className="text-yellow-400">{txStatus.message}</span>
              </div>
              {txStatus.hash && (
                <p className="tx-hash text-yellow-300 mt-2 break-all">
                  TX: {txStatus.hash}
                </p>
              )}
            </div>
          )}

          {txStatus.status === 'success' && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400">{txStatus.message}</span>
              </div>
            </div>
          )}

          {txStatus.status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400">{txStatus.message}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}