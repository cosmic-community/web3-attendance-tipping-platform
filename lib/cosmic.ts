import { createBucketClient } from '@cosmicjs/sdk'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Helper function for simple error checking
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Fetch all attendance sessions
export async function getAttendanceSessions() {
  try {
    const response = await cosmic.objects
      .find({ type: 'attendance-sessions' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects.sort((a, b) => {
      const dateA = new Date(a.metadata?.session_date || '').getTime();
      const dateB = new Date(b.metadata?.session_date || '').getTime();
      return dateB - dateA; // Newest first
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch attendance sessions');
  }
}

// Fetch all attendees
export async function getAttendees() {
  try {
    const response = await cosmic.objects
      .find({ type: 'attendees' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects.sort((a, b) => {
      const attendanceA = a.metadata?.total_attendance || 0;
      const attendanceB = b.metadata?.total_attendance || 0;
      return attendanceB - attendanceA; // Most active first
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch attendees');
  }
}

// Fetch all tips
export async function getTips() {
  try {
    const response = await cosmic.objects
      .find({ type: 'tips' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects.sort((a, b) => {
      const dateA = new Date(a.metadata?.tip_date || '').getTime();
      const dateB = new Date(b.metadata?.tip_date || '').getTime();
      return dateB - dateA; // Newest first
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch tips');
  }
}

// Create a new attendance session
export async function createAttendanceSession(sessionName: string, creatorAddress: string, description?: string) {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'attendance-sessions',
      title: sessionName,
      metadata: {
        session_name: sessionName,
        session_date: new Date().toISOString().split('T')[0],
        creator_address: creatorAddress,
        status: 'Pending', // Use exact value from content model
        description: description || '',
      }
    });
    
    return response.object;
  } catch (error) {
    console.error('Error creating attendance session:', error);
    throw new Error('Failed to create attendance session');
  }
}

// Create a new tip record
export async function createTipRecord(
  amount: string,
  senderAddress: string,
  recipientAddress: string,
  transactionHash: string,
  relatedSessionId?: string
) {
  try {
    const metadata: any = {
      amount_eth: amount,
      sender_address: senderAddress,
      recipient_address: recipientAddress,
      transaction_hash: transactionHash,
      tip_date: new Date().toISOString().split('T')[0],
      status: 'Confirmed', // Use exact value from content model
    };

    // Add related session if provided
    if (relatedSessionId) {
      metadata.related_session = relatedSessionId;
    }

    const response = await cosmic.objects.insertOne({
      type: 'tips',
      title: `Tip Transaction ${transactionHash.slice(0, 8)}...`,
      metadata
    });
    
    return response.object;
  } catch (error) {
    console.error('Error creating tip record:', error);
    throw new Error('Failed to create tip record');
  }
}

// Update session with blockchain data
export async function updateSessionWithBlockchainData(
  sessionId: string,
  blockchainSessionId: number,
  transactionHash: string
) {
  try {
    const response = await cosmic.objects.updateOne(sessionId, {
      metadata: {
        session_id: blockchainSessionId,
        transaction_hash: transactionHash,
        status: 'Active' // Use exact value from content model
      }
    });
    
    return response.object;
  } catch (error) {
    console.error('Error updating session:', error);
    throw new Error('Failed to update session');
  }
}