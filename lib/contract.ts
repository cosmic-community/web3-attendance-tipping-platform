import { ethers } from 'ethers'

// Mock contract ABI - replace with your actual contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}],
    "name": "createSession",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "sessionId", "type": "uint256"}],
    "name": "markAttendance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "sessionId", "type": "uint256"}],
    "name": "getSession",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "sessionId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"}
    ],
    "name": "SessionCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "sessionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "attendee", "type": "address"}
    ],
    "name": "AttendanceMarked",
    "type": "event"
  }
];

// Mock contract address - replace with your actual deployed contract address
export const CONTRACT_ADDRESS = "0x742d35Cc6635C0532925a3b8D5C9E20066c40b86";

// Predefined recipient address for tips
export const TIP_RECIPIENT_ADDRESS = "0x9876543210fedcba9876543210fedcba98765432";

export async function getContract(signer: ethers.Signer): Promise<ethers.Contract> {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function createSession(contract: ethers.Contract, sessionName: string): Promise<ethers.TransactionResponse> {
  return await contract.createSession(sessionName);
}

export async function markAttendance(contract: ethers.Contract, sessionId: number): Promise<ethers.TransactionResponse> {
  return await contract.markAttendance(sessionId);
}

export async function getSessionInfo(contract: ethers.Contract, sessionId: number): Promise<{name: string, creator: string, active: boolean}> {
  const [name, creator, active] = await contract.getSession(sessionId);
  return { name, creator, active };
}

export async function sendTip(signer: ethers.Signer, recipientAddress: string, amount: string): Promise<ethers.TransactionResponse> {
  return await signer.sendTransaction({
    to: recipientAddress,
    value: ethers.parseEther(amount)
  });
}