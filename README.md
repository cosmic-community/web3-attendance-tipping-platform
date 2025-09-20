# Web3 Attendance & Tipping Platform

![App Preview](https://imgix.cosmicjs.com/562765e0-9609-11f0-bba7-d56988718db7-photo-1531482615713-2afd69097998-1758362726547.jpg?w=1200&h=300&fit=crop&auto=format,compress)

A comprehensive Web3 application that manages attendance sessions and facilitates ETH tipping through MetaMask integration. Users can create attendance sessions, mark their attendance, and send tips to session organizers, all while tracking their participation history through a modern, responsive interface.

## ✨ Features

- **MetaMask Wallet Integration** - Connect and manage your Ethereum wallet
- **Attendance Session Management** - Create and participate in educational sessions
- **Smart Contract Interactions** - Direct blockchain integration using ethers.js
- **ETH Tipping System** - Send tips to session organizers with transparent fee tracking
- **Real-time Transaction Monitoring** - Live status updates for all blockchain operations
- **Responsive Dashboard** - Mobile-friendly interface optimized for Web3 interactions
- **Content Management Integration** - Comprehensive data tracking through Cosmic CMS

## Clone this Project

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Project](https://img.shields.io/badge/Clone%20this%20Project-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](https://app.cosmicjs.com/projects/new?clone_bucket=68ce7bdad7c81076a7d6bef6&clone_repository=68ce7f60d7c81076a7d6bf13)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> "Create a simple React app that:
> 
> Connects to MetaMask wallet.
> 
> Has a form/button to create an attendance session (calls a smart contract function createSession(string name)).
> 
> Allows the connected user to mark their attendance by calling markAttendance(uint256 sessionId) on the smart contract.
> 
> Has an input box and button to send a tip (ETH) to a predefined address using MetaMask.
> 
> Uses ethers.js for blockchain interaction.
> 
> Displays status messages for wallet connection, transactions, and errors.
> 
> Keep UI minimal with basic styling.
> 
> Assume the contract ABI and address are imported and available as variables."

### Code Generation Prompt

> Based on the content model I created for the above requirements, now build a complete web application that showcases this content. Include a modern, responsive design with proper navigation, content display, and user-friendly interface.

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🚀 Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **ethers.js** - Ethereum blockchain interactions
- **Cosmic CMS** - Content management and data storage
- **MetaMask** - Ethereum wallet integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- Bun package manager
- MetaMask browser extension
- Ethereum testnet ETH (for testing)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web3-attendance-platform
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
COSMIC_WRITE_KEY=your-write-key
```

4. Start the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Cosmic SDK Examples

### Fetching Attendance Sessions
```typescript
import { cosmic } from '@/lib/cosmic'

const sessions = await cosmic.objects
  .find({ type: 'attendance-sessions' })
  .props(['id', 'title', 'metadata'])
  .depth(1)
```

### Creating New Tip Record
```typescript
const tip = await cosmic.objects.insertOne({
  type: 'tips',
  title: 'New Tip Transaction',
  metadata: {
    amount_eth: '0.1',
    sender_address: walletAddress,
    recipient_address: recipientAddress,
    transaction_hash: txHash,
    tip_date: new Date().toISOString(),
    status: 'confirmed'
  }
})
```

## 🔗 Cosmic CMS Integration

The application integrates with Cosmic CMS to manage:

- **Attendance Sessions** - Track session details, creators, and blockchain data
- **Attendees** - Manage participant profiles and attendance history
- **Tips** - Store tip transactions with comprehensive metadata
- **Real-time Updates** - Sync blockchain events with content management

Key features:
- Automatic data synchronization between blockchain and CMS
- Comprehensive transaction tracking and analytics
- User profile management with attendance statistics
- Session management with creator verification

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds

### Netlify
1. Connect repository to Netlify
2. Set build command: `bun run build`
3. Set publish directory: `out`
4. Add environment variables

### Environment Variables Setup
Add these variables in your deployment platform:
- `COSMIC_BUCKET_SLUG` - Your Cosmic bucket identifier
- `COSMIC_READ_KEY` - Read access key from Cosmic
- `COSMIC_WRITE_KEY` - Write access key for creating records

For development, create a `.env.local` file with these variables.
<!-- README_END -->