'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import type { WalletState } from '@/types'

export default function WalletConnector() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected on load
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const balance = await provider.getBalance(address)
          const network = await provider.getNetwork()
          
          setWalletState({
            isConnected: true,
            address,
            balance: ethers.formatEther(balance),
            chainId: Number(network.chainId),
          })
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()

      setWalletState({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
      })

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
    })
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      checkWalletConnection()
    }
  }

  const handleChainChanged = () => {
    checkWalletConnection()
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 5:
        return 'Goerli Testnet'
      default:
        return `Chain ID: ${chainId}`
    }
  }

  if (walletState.isConnected) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-400">✅ Wallet Connected</h3>
          <button
            onClick={disconnectWallet}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="label text-xs text-slate-400">Address</label>
            <div className="eth-address text-sm bg-slate-800 rounded px-2 py-1">
              {walletState.address}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs text-slate-400">Balance</label>
              <div className="text-sm">
                {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : '0 ETH'}
              </div>
            </div>
            <div>
              <label className="label text-xs text-slate-400">Network</label>
              <div className="text-sm">
                {walletState.chainId ? getChainName(walletState.chainId) : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-slate-400 mb-4">
          Connect your MetaMask wallet to start creating sessions and sending tips
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn btn-primary w-full"
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="spinner"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
            <span>Connect MetaMask</span>
          </div>
        )}
      </button>

      <p className="text-xs text-slate-500 mt-2">
        Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Install it here</a>
      </p>
    </div>
  )
}