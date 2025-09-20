'use client'

import { useState } from 'react'
import { sendTipOnChain } from '@/lib/contract'
import { createTipRecord } from '@/lib/cosmic'
import type { TipFormData, TransactionStatus } from '@/types'

export default function TipForm() {
  const [formData, setFormData] = useState<TipFormData>({
    amount: '',
    recipientAddress: ''
  })
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.recipientAddress) {
      alert('Please fill in all fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    // Check if MetaMask is available
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is required to send tips')
      return
    }

    setTxStatus({ status: 'pending', message: 'Sending tip...' })

    try {
      // Check if wallet is connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      if (accounts.length === 0) {
        throw new Error('Please connect your wallet first')
      }

      const senderAddress = accounts[0]

      // Send tip on blockchain
      const result = await sendTipOnChain(formData.recipientAddress, formData.amount)

      // Calculate gas fee
      const gasFeeWei = BigInt(result.gasUsed) * BigInt(result.effectiveGasPrice)
      const gasFeeEth = (Number(gasFeeWei) / 1e18).toFixed(6)

      // Create tip record in Cosmic CMS
      await createTipRecord(
        formData.amount,
        senderAddress,
        formData.recipientAddress,
        result.transactionHash
      )

      setTxStatus({
        status: 'success',
        message: `Tip sent successfully! Gas fee: ${gasFeeEth} ETH`,
        hash: result.transactionHash
      })

      // Reset form
      setFormData({ amount: '', recipientAddress: '' })

      // Auto-clear success message
      setTimeout(() => {
        setTxStatus({ status: 'idle' })
      }, 5000)

    } catch (error: any) {
      console.error('Error sending tip:', error)
      setTxStatus({
        status: 'error',
        message: error.message || 'Failed to send tip'
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
      <h2 className="text-2xl font-bold mb-4">Send ETH Tip</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Amount (ETH) *</label>
          <div className="relative">
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="input pr-12"
              placeholder="0.01"
              step="0.001"
              min="0"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
              ETH
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Minimum: 0.001 ETH (plus gas fees)
          </p>
        </div>

        <div>
          <label className="label">Recipient Address *</label>
          <input
            type="text"
            value={formData.recipientAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
            className="input font-mono text-sm"
            placeholder="0x1234...abcd"
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Enter a valid Ethereum address
          </p>
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
              Sending Tip...
            </>
          ) : (
            '💰 Send Tip'
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
        <h4 className="font-semibold mb-2">💡 Tip Guidelines:</h4>
        <ul className="space-y-1 text-slate-300 text-xs">
          <li>• Tips are sent directly to the recipient's wallet</li>
          <li>• Gas fees are additional to the tip amount</li>
          <li>• All transactions are recorded on the blockchain</li>
          <li>• Tips can be sent to session organizers or any ETH address</li>
        </ul>
      </div>
    </section>
  )
}