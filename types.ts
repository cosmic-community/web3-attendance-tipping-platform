import { ethers } from 'ethers'

// Extend Window interface for MetaMask ethereum object
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Attendance Session interface
export interface AttendanceSession extends CosmicObject {
  type: 'attendance-sessions';
  metadata: {
    session_name: string;
    session_date: string;
    creator_address: string;
    session_id?: number;
    transaction_hash?: string;
    status: {
      key: string;
      value: SessionStatus;
    };
    description?: string;
  };
}

// Attendee interface
export interface Attendee extends CosmicObject {
  type: 'attendees';
  metadata: {
    name: string;
    wallet_address: string;
    email?: string;
    sessions_attended?: AttendanceSession[];
    total_attendance?: number;
    join_date?: string;
    profile_picture?: {
      url: string;
      imgix_url: string;
    };
  };
}

// Tip interface
export interface Tip extends CosmicObject {
  type: 'tips';
  metadata: {
    amount_eth: string;
    sender_address: string;
    recipient_address: string;
    transaction_hash: string;
    tip_date: string;
    related_session?: AttendanceSession;
    status: {
      key: string;
      value: TipStatus;
    };
    gas_fee_eth?: string;
  };
}

// Type literals for select-dropdown values (exact from content model)
export type SessionStatus = 'Active' | 'Closed' | 'Pending';
export type TipStatus = 'Confirmed' | 'Pending' | 'Failed';

// API response types
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Wallet connection types
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
}

// Transaction status types
export interface TransactionStatus {
  hash?: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
}

// Smart contract interfaces
export interface ContractInteraction {
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
}

// Form data types
export interface CreateSessionFormData {
  sessionName: string;
  description?: string;
}

export interface TipFormData {
  amount: string;
  recipientAddress: string;
}

// Component prop types
export interface WalletConnectorProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  walletState: WalletState;
}

export interface SessionCardProps {
  session: AttendanceSession;
  onMarkAttendance?: (sessionId: number) => void;
  canMarkAttendance?: boolean;
}

export interface TipCardProps {
  tip: Tip;
}

export interface AttendeeCardProps {
  attendee: Attendee;
}

// Type guards for runtime validation
export function isAttendanceSession(obj: CosmicObject): obj is AttendanceSession {
  return obj.type === 'attendance-sessions';
}

export function isAttendee(obj: CosmicObject): obj is Attendee {
  return obj.type === 'attendees';
}

export function isTip(obj: CosmicObject): obj is Tip {
  return obj.type === 'tips';
}

// Utility types with proper constraint
export type OptionalMetadata<T extends CosmicObject> = Partial<T['metadata']>;
export type CreateSessionData = Omit<AttendanceSession, 'id' | 'created_at' | 'modified_at'>;
export type CreateTipData = Omit<Tip, 'id' | 'created_at' | 'modified_at'>;