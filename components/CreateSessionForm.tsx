'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract, createSession } from '@/lib/contract'
import { createAttendanceSession, updateSessionWithBlockchainData } from '@/lib/cosmic'
import type { TransactionStatus } from '@/types'

export default function CreateSessionForm() {
  const [sessionName, setSessionName] = useState('')
  const [description, setDescription] = useState('')
  const [txStatus, setTxStatus] = useState<TransactionStatus>({ status: 'idle' })

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionName.trim()) {
      setTxStatus({
        status: 'error',
        message: 'Session name is required'
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

    setTxStatus({ status: 'pending', message: 'Creating session...' })

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // First create record in Cosmic CMS
      const cosmicSession = await createAttendanceSession(
        sessionName,
        userAddress,
        description
      )
      
      setTxStatus({ status: 'pending', message: 'Confirming blockchain transaction...' })
      
      // Then create on blockchain
      const contract = await getContract(signer)
      const tx = await createSession(contract, sessionName)
      
      setTxStatus({ 
        status: 'pending', 
        message: 'Transaction submitted. Waiting for confirmation...',
        hash: tx.hash 
      })

      // Wait for transaction to be mined
      const receipt = await tx.wait()
      
      if (receipt) {
        // Extract session ID from logs (assuming SessionCreated event)
        const sessionCreatedEvent = receipt.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log)
            return parsedLog?.name === 'SessionCreated'
          } catch {
            return false
          }
        })

        let blockchainSessionId = 1 // Default fallback
        if (sessionCreatedEvent) {
          const parsedLog = contract.interface.parseLog(sessionCreatedEvent)
          blockchainSessionId = Number(parsedLog?.args[0] || 1)
        }

        // Update Cosmic record with blockchain data
        await updateSessionWithBlockchainData(
          cosmicSession.id,
          blockchainSessionId,
          tx.hash
        )

        setTxStatus({
          status: 'success',
          message: 'Session created successfully!',
          hash: tx.hash
        })

        // Reset form
        setSessionName('')
        setDescription('')
      }
    } catch (error: any) {
      console.error('Error creating session:', error)
      setTxStatus({
        status: 'error',
        message: error.message || 'Failed to create session'
      })
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Create Attendance Session</h2>
      
      <form onSubmit={handleCreateSession} className="space-y-4">
        <div>
          <label htmlFor="sessionName" className="label">
            Session Name *
          </label>
          <input
            id="sessionName"
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="input"
            placeholder="e.g., Blockchain Security Workshop"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input min-h-[80px] resize-none"
            placeholder="Optional description of the session..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={txStatus.status === 'pending'}
          className="btn btn-primary w-full"
        >
          {txStatus.status === 'pending' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="spinner"></div>
              <span>Creating...</span>
            </div>
          ) : (
            'Create Session'
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
                <span className="text-green-400">{txStatus.message}</span>
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