import { ethers } from 'ethers'

// Contract ABI (simplified for demo purposes)
const CONTRACT_ABI = [
  "function createSession(string memory sessionName) public returns (uint256)",
  "function markAttendance(uint256 sessionId) public",
  "function getSession(uint256 sessionId) public view returns (string memory, address, uint256)",
  "function tip(address payable recipient) public payable",
  "event SessionCreated(uint256 sessionId, string sessionName, address creator)",
  "event AttendanceMarked(uint256 sessionId, address attendee)",
  "event TipSent(address from, address to, uint256 amount)"
]

// Contract address (replace with actual deployed contract address)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x742d35Cc6634C0532925a3b8D0A71Fcf5C6C5cE7"

// Get contract instance
async function getContract() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not available')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  
  return { contract, signer, provider }
}

// Create attendance session on blockchain
export async function createAttendanceSessionOnChain(sessionName: string) {
  try {
    const { contract } = await getContract()
    
    if (!contract.createSession) {
      throw new Error('Contract method not available')
    }

    const tx = await contract.createSession(sessionName)
    const receipt = await tx.wait()
    
    // Extract session ID from events
    let sessionId = 0
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics,
            data: log.data
          })
          if (parsedLog && parsedLog.name === 'SessionCreated') {
            sessionId = Number(parsedLog.args[0])
            break
          }
        } catch (e) {
          // Log parsing failed, continue
          continue
        }
      }
    }
    
    return {
      transactionHash: tx.hash,
      sessionId,
      gasUsed: receipt ? receipt.gasUsed : 0,
      effectiveGasPrice: receipt ? receipt.gasPrice || receipt.effectiveGasPrice : 0
    }
  } catch (error: any) {
    console.error('Blockchain error:', error)
    throw new Error(error.message || 'Failed to create session on blockchain')
  }
}

// Mark attendance on blockchain
export async function markAttendanceOnChain(sessionId: number) {
  try {
    const { contract } = await getContract()
    
    if (!contract.markAttendance) {
      throw new Error('Contract method not available')
    }

    const tx = await contract.markAttendance(sessionId)
    const receipt = await tx.wait()
    
    return {
      transactionHash: tx.hash,
      gasUsed: receipt ? receipt.gasUsed : 0,
      effectiveGasPrice: receipt ? receipt.gasPrice || receipt.effectiveGasPrice : 0
    }
  } catch (error: any) {
    console.error('Blockchain error:', error)
    throw new Error(error.message || 'Failed to mark attendance on blockchain')
  }
}

// Send tip on blockchain
export async function sendTipOnChain(recipientAddress: string, amountEth: string) {
  try {
    const { contract } = await getContract()
    
    if (!contract.tip) {
      throw new Error('Contract method not available')
    }

    const amountWei = ethers.parseEther(amountEth)
    
    const tx = await contract.tip(recipientAddress, {
      value: amountWei
    })
    const receipt = await tx.wait()
    
    return {
      transactionHash: tx.hash,
      gasUsed: receipt ? receipt.gasUsed : 0,
      effectiveGasPrice: receipt ? receipt.gasPrice || receipt.effectiveGasPrice : 0
    }
  } catch (error: any) {
    console.error('Blockchain error:', error)
    throw new Error(error.message || 'Failed to send tip on blockchain')
  }
}

// Get session details from blockchain
export async function getSessionFromBlockchain(sessionId: number) {
  try {
    const { contract } = await getContract()
    
    if (!contract.getSession) {
      throw new Error('Contract method not available')
    }

    const result = await contract.getSession(sessionId)
    
    return {
      sessionName: result[0],
      creator: result[1],
      timestamp: Number(result[2])
    }
  } catch (error: any) {
    console.error('Blockchain error:', error)
    throw new Error(error.message || 'Failed to get session from blockchain')
  }
}