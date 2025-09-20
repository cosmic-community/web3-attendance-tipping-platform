'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { TIP_RECIPIENT_ADDRESS, sendTip } from '@/lib/contract'
import { createTipRecord } from '@/lib/cosmic'
import type { TransactionStatus } from '@/types'

export default function TipForm() {
  const [amount, setAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState(TIP_RECIPIENT_ADDRESS)
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const handleSendTip = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      setTxStatus({
        status: 'error',
        message: 'Please enter a valid tip amount'
      })
      return
    }

    if (!ethers.isAddress(recipientAddress)) {
      setTxStatus({
        status: 'error',
        message: 'Please enter a valid recipient address'
      })
      return
    }

    if (!window.ethereum) {
      setTxStatus({
        status: 'error',
        message: 'MetaMask not detected. Please install MetaMask.'
      })
      return
    }

    setTxStatus({ status: 'pending', message: 'Preparing tip transaction...' })

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // Check if user has sufficient balance
      const balance = await provider.getBalance(userAddress)
      const tipAmount = ethers.parseEther(amount)
      
      if (balance < tipAmount) {
        setTxStatus({
          status: 'error',
          message: 'Insufficient balance for this tip amount'
        })
        return
      }
      
      setTxStatus({ status: 'pending', message: 'Sending tip...' })
      
      // Send tip transaction
      const tx = await sendTip(signer, recipientAddress, amount)
      
      setTxStatus({ 
        status: 'pending', 
        message: 'Transaction submitted. Waiting for confirmation...',
        hash: tx.hash 
      })

      // Wait for transaction to be mined
      const receipt = await tx.wait()
      
      if (receipt) {
        // Calculate gas fee
        const gasUsed = receipt.gasUsed
        const gasPrice = receipt.gasPrice || tx.gasPrice || BigInt(0)
        const gasFee = ethers.formatEther(gasUsed * gasPrice)

        // Create record in Cosmic CMS
        await createTipRecord(
          amount,
          userAddress,
          recipientAddress,
          tx.hash
        )

        setTxStatus({
          status: 'success',
          message: `Tip of ${amount} ETH sent successfully! Gas fee: ${parseFloat(gasFee).toFixed(6)} ETH`,
          hash: tx.hash
        })

        // Reset form
        setAmount('')
      }
    } catch (error: any) {
      console.error('Error sending tip:', error)
      let errorMessage = 'Failed to send tip'
      
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was cancelled by user'
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction'
      } else if (error.message.includes('gas')) {
        errorMessage = 'Gas estimation failed. Please try again.'
      }
      
      setTxStatus({
        status: 'error',
        message: errorMessage
      })
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Send ETH Tip</h2>
      
      <form onSubmit={handleSendTip} className="space-y-4">
        <div>
          <label htmlFor="tipAmount" className="label">
            Tip Amount (ETH) *
          </label>
          <input
            id="tipAmount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder="0.01"
            step="0.001"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="recipientAddress" className="label">
            Recipient Address *
          </label>
          <input
            id="recipientAddress"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="input eth-address"
            placeholder="0x..."
            required
          />
          <p className="text-xs text-slate-400 mt-1">
            Default recipient is the platform organizer
          </p>
        </div>

        <button
          type="submit"
          disabled={txStatus.status === 'pending'}
          className="btn btn-primary w-full"
        >
          {txStatus.status === 'pending' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner"></div>
              <span>Sending...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
              </svg>
              <span>Send Tip</span>
            </div>
          )}
        </button>
      </form>

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
                <div className="text-green-400">
                  <p>{txStatus.message}</p>
                </div>
              </div>
              {txStatus.hash && (
                <p className="tx-hash text-green-300 mt-2 break-all">
                  TX: {txStatus.hash}
                </p>
              )}
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