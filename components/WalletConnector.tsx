'use client'

import { useState, useEffect } from 'react'
import { getCurrentWalletAddress, getWalletBalance } from '@/lib/contract'
import type { WalletState } from '@/types'

export default function WalletConnector() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection()
    
    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          updateWalletInfo()
        }
      }

      const handleChainChanged = () => {
        updateWalletInfo()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await updateWalletInfo()
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is required to use this application. Please install MetaMask.')
      return
    }

    setIsConnecting(true)

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await updateWalletInfo()
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null
    })
  }

  const updateWalletInfo = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const address = await getCurrentWalletAddress()
        const balance = await getWalletBalance()
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })

        setWalletState({
          isConnected: true,
          address,
          balance,
          chainId: parseInt(chainId, 16)
        })
      } catch (error) {
        console.error('Error updating wallet info:', error)
      }
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4)
  }

  if (walletState.isConnected && walletState.address) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="btn-secondary text-sm px-3 py-1"
          >
            Disconnect
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label text-xs">Address</label>
            <div className="eth-address bg-slate-800 rounded px-3 py-2 text-sm">
              {formatAddress(walletState.address)}
            </div>
          </div>

          {walletState.balance && (
            <div>
              <label className="label text-xs">Balance</label>
              <div className="text-lg font-semibold">
                {formatBalance(walletState.balance)} ETH
              </div>
            </div>
          )}

          {walletState.chainId && (
            <div>
              <label className="label text-xs">Chain ID</label>
              <div className="text-sm">{walletState.chainId}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
        </svg>
      </div>

      <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
      <p className="text-slate-400 mb-6">
        Connect your MetaMask wallet to create sessions and send tips
      </p>

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-primary w-full"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          'Connect MetaMask'
        )}
      </button>

      {typeof window !== 'undefined' && !window.ethereum && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded text-warning text-sm">
          <p>⚠️ MetaMask not detected. <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" className="underline">Install MetaMask</a> to continue.</p>
        </div>
      )}
    </div>
  )
}