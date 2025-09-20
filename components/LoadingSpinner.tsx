export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-primary rounded-full animate-spin"></div>
        <span className="text-slate-400">Loading...</span>
      </div>
    </div>
  )
}