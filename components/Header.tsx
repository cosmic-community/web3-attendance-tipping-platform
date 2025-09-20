import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold">Web3 Platform</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#sessions" className="text-slate-300 hover:text-white transition-colors">
              Sessions
            </Link>
            <Link href="#attendees" className="text-slate-300 hover:text-white transition-colors">
              Attendees
            </Link>
            <Link href="#tips" className="text-slate-300 hover:text-white transition-colors">
              Tips
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Blockchain Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}