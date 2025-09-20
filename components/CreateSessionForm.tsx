'use client'

import { useState } from 'react'
import { createAttendanceSessionOnChain } from '@/lib/contract'
import { createAttendanceSession, updateSessionWithBlockchainData } from '@/lib/cosmic'
import type { CreateSessionFormData, TransactionStatus } from '@/types'

export default function CreateSessionForm() {
  const [formData, setFormData] = useState<CreateSessionFormData>({
    sessionName: '',
    description: ''
  })
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sessionName.trim()) {
      alert('Please enter a session name')
      return
    }

    // Check if MetaMask is available
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is required to create sessions')
      return
    }

    setTxStatus({ status: 'pending', message: 'Creating session...' })

    try {
      // Check if wallet is connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      if (accounts.length === 0) {
        throw new Error('Please connect your wallet first')
      }

      const creatorAddress = accounts[0]

      // First create in Cosmic CMS
      const cosmicSession = await createAttendanceSession(
        formData.sessionName,
        creatorAddress,
        formData.description
      )

      // Then create on blockchain
      const blockchainResult = await createAttendanceSessionOnChain(formData.sessionName)

      // Update Cosmic session with blockchain data
      await updateSessionWithBlockchainData(
        cosmicSession.id,
        blockchainResult.sessionId,
        blockchainResult.transactionHash
      )

      setTxStatus({
        status: 'success',
        message: `Session created successfully! Session ID: ${blockchainResult.sessionId}`,
        hash: blockchainResult.transactionHash
      })

      // Reset form
      setFormData({ sessionName: '', description: '' })

      // Auto-clear success message
      setTimeout(() => {
        setTxStatus({ status: 'idle' })
      }, 5000)

    } catch (error: any) {
      console.error('Error creating session:', error)
      setTxStatus({
        status: 'error',
        message: error.message || 'Failed to create session'
      })
    }
  }

  const getStatusColor = () => {
    switch (txStatus.status) {
      case 'pending': return 'text-warning bg-warning/10'
      case 'success': return 'text-success bg-success/10'
      case 'error': return 'text-error bg-error/10'
      default: return ''
    }
  }

  return (
    <section className="card">
      <h2 className="text-2xl font-bold mb-4">Create Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Session Name *</label>
          <input
            type="text"
            value={formData.sessionName}
            onChange={(e) => setFormData(prev => ({ ...prev, sessionName: e.target.value }))}
            className="input"
            placeholder="Web3 Development Workshop"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="input resize-none"
            placeholder="Brief description of the session..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={txStatus.status === 'pending'}
          className="btn-primary w-full"
        >
          {txStatus.status === 'pending' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Session...
            </>
          ) : (
            '✨ Create Session'
          )}
        </button>

        {/* Transaction Status */}
        {txStatus.status !== 'idle' && (
          <div className={`p-3 rounded text-sm ${getStatusColor()}`}>
            <p>{txStatus.message}</p>
            {txStatus.hash && (
              <p className="mt-1 text-xs opacity-70">
                TX: {txStatus.hash.slice(0, 10)}...{txStatus.hash.slice(-8)}
              </p>
            )}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-slate-800 rounded text-sm">
        <h4 className="font-semibold mb-2">📋 Session Guidelines:</h4>
        <ul className="space-y-1 text-slate-300 text-xs">
          <li>• Sessions are recorded on the blockchain for transparency</li>
          <li>• Each session gets a unique ID for attendance tracking</li>
          <li>• Gas fees are required for blockchain transactions</li>
          <li>• Session creators can manage attendance and receive tips</li>
        </ul>
      </div>
    </section>
  )
}