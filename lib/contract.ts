import { ethers } from 'ethers'

// Contract configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

// Simple ABI for attendance and tipping functions
const CONTRACT_ABI = [
  "function createSession(string memory sessionName) public returns (uint256)",
  "function markAttendance(uint256 sessionId) public",
  "function getSession(uint256 sessionId) public view returns (string memory, address, bool)",
  "function sendTip(address payable recipient) public payable",
  "event SessionCreated(uint256 sessionId, string sessionName, address creator)",
  "event AttendanceMarked(uint256 sessionId, address attendee)",
  "event TipSent(address from, address to, uint256 amount)"
]

// Get provider and signer
export async function getWeb3Provider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return { provider, signer }
  }
  throw new Error('MetaMask not found')
}

// Get contract instance
export async function getContract() {
  const { provider, signer } = await getWeb3Provider()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  return { contract, signer }
}

// Create a new session on the blockchain
export async function createSessionOnChain(sessionName: string) {
  try {
    const { contract, signer } = await getContract()
    
    if (!contract || !signer) {
      throw new Error('Contract or signer not available')
    }

    // Check if createSession method exists
    if (!contract.createSession) {
      throw new Error('createSession method not found on contract')
    }

    const tx = await contract.createSession(sessionName)
    const receipt = await tx.wait()
    
    // Extract session ID from logs
    const sessionCreatedLog = receipt.logs.find((log: any) => 
      log.fragment && log.fragment.name === 'SessionCreated'
    )
    
    const sessionId = sessionCreatedLog ? sessionCreatedLog.args[0] : null
    
    return {
      transactionHash: receipt.hash,
      sessionId: sessionId ? Number(sessionId) : null,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    }
  } catch (error) {
    console.error('Error creating session on chain:', error)
    throw error
  }
}

// Mark attendance for a session
export async function markAttendanceOnChain(sessionId: number) {
  try {
    const { contract } = await getContract()
    
    if (!contract) {
      throw new Error('Contract not available')
    }

    // Check if markAttendance method exists
    if (!contract.markAttendance) {
      throw new Error('markAttendance method not found on contract')
    }

    const tx = await contract.markAttendance(sessionId)
    const receipt = await tx.wait()
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    }
  } catch (error) {
    console.error('Error marking attendance on chain:', error)
    throw error
  }
}

// Get session details from blockchain
export async function getSessionFromChain(sessionId: number) {
  try {
    const { contract } = await getContract()
    
    if (!contract) {
      throw new Error('Contract not available')
    }

    // Check if getSession method exists before calling
    if (!contract.getSession) {
      throw new Error('getSession method not found on contract')
    }

    const sessionData = await contract.getSession(sessionId)
    
    return {
      name: sessionData[0],
      creator: sessionData[1],
      active: sessionData[2]
    }
  } catch (error) {
    console.error('Error getting session from chain:', error)
    throw error
  }
}

// Send a tip to a recipient
export async function sendTipOnChain(recipientAddress: string, amountInEth: string) {
  try {
    const { contract } = await getContract()
    
    if (!contract) {
      throw new Error('Contract not available')
    }

    // Check if sendTip method exists
    if (!contract.sendTip) {
      throw new Error('sendTip method not found on contract')
    }

    const amountInWei = ethers.parseEther(amountInEth)
    
    const tx = await contract.sendTip(recipientAddress, {
      value: amountInWei
    })
    
    const receipt = await tx.wait()
    
    return {
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice.toString()
    }
  } catch (error) {
    console.error('Error sending tip on chain:', error)
    throw error
  }
}

// Get current wallet address
export async function getCurrentWalletAddress(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      return await signer.getAddress()
    }
    return null
  } catch (error) {
    console.error('Error getting wallet address:', error)
    return null
  }
}

// Get wallet balance
export async function getWalletBalance(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    }
    return null
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    return null
  }
}