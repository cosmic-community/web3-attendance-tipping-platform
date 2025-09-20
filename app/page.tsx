import { Suspense } from 'react'
import Header from '@/components/Header'
import WalletConnector from '@/components/WalletConnector'
import AttendanceSessionsSection from '@/components/AttendanceSessionsSection'
import AttendeesSection from '@/components/AttendeesSection'
import TipsSection from '@/components/TipsSection'
import CreateSessionForm from '@/components/CreateSessionForm'
import TipForm from '@/components/TipForm'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
            Web3 Attendance & Tipping Platform
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Manage attendance sessions and send ETH tips seamlessly through MetaMask integration. 
            Connect your wallet to get started with blockchain-powered event management.
          </p>
          <WalletConnector />
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={<LoadingSpinner />}>
              <CreateSessionForm />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <TipForm />
            </Suspense>
          </div>

          {/* Right Column - Data Display */}
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <AttendanceSessionsSection />
            </Suspense>
            
            <Suspense fallback={<LoadingSpinner />}>
              <AttendeesSection />
            </Suspense>
            
            <Suspense fallback={<LoadingSpinner />}>
              <TipsSection />
            </Suspense>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-12 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need for Web3 event management and community engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Attendance</h3>
              <p className="text-slate-400">
                Blockchain-verified attendance tracking with transparent record keeping
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">ETH Tipping</h3>
              <p className="text-slate-400">
                Send appreciation tips directly to session organizers with MetaMask
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-slate-400">
                Live transaction status and instant feedback for all blockchain operations
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}