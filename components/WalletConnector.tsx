'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import type { WalletState } from '@/types'

export default function WalletConnector() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null
  })
  const [isLoading, setIsLoading] = useState(false)

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection()
    setupEventListeners()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[]
      if (accounts.length > 0) {
        await updateWalletState(accounts[0])
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  const setupEventListeners = () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    // Account changed
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState({
          isConnected: false,
          address: null,
          balance: null,
          chainId: null
        })
      } else {
        updateWalletState(accounts[0])
      }
    })

    // Chain changed
    window.ethereum.on('chainChanged', (chainId: string) => {
      setWalletState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16)
      }))
    })

    // Cleanup listeners on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }

  const updateWalletState = async (address: string) => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      // Get balance
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      const balanceInEth = ethers.formatEther(balance)

      // Get chain ID
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)

      setWalletState({
        isConnected: true,
        address,
        balance: parseFloat(balanceInEth).toFixed(4),
        chainId
      })
    } catch (error) {
      console.error('Error updating wallet state:', error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask to connect your wallet')
      return
    }

    setIsLoading(true)

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      if (accounts.length > 0) {
        await updateWalletState(accounts[0])
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        alert('Please connect to MetaMask')
      } else {
        alert('Error connecting wallet: ' + error.message)
      }
    } finally {
      setIsLoading(false)
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet'
      case 11155111: return 'Sepolia Testnet'
      case 5: return 'Goerli Testnet'
      case 137: return 'Polygon Mainnet'
      default: return `Chain ID: ${chainId}`
    }
  }

  if (!walletState.isConnected) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="btn-primary px-8 py-3 text-lg"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            '🦊 Connect MetaMask'
          )}
        </button>
        
        {typeof window !== 'undefined' && !window.ethereum && (
          <p className="text-sm text-slate-400 text-center">
            Don't have MetaMask? 
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Install it here
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wallet Connected</h3>
        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <label className="label text-xs text-slate-400">Address</label>
          <div className="eth-address bg-slate-800 rounded px-3 py-2 font-mono">
            {walletState.address ? formatAddress(walletState.address) : 'Unknown'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs text-slate-400">Balance</label>
            <div className="bg-slate-800 rounded px-3 py-2">
              {walletState.balance ? `${walletState.balance} ETH` : '0.0000 ETH'}
            </div>
          </div>
          
          <div>
            <label className="label text-xs text-slate-400">Network</label>
            <div className="bg-slate-800 rounded px-3 py-2 text-xs">
              {walletState.chainId ? getNetworkName(walletState.chainId) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={disconnectWallet}
        className="btn-secondary w-full mt-4 text-sm"
      >
        Disconnect
      </button>
    </div>
  )
}