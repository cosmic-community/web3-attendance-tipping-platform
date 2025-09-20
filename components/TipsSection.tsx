import { getTips } from '@/lib/cosmic'
import TipCard from '@/components/TipCard'
import type { Tip } from '@/types'

export default async function TipsSection() {
  const tips = await getTips() as Tip[]

  if (!tips || tips.length === 0) {
    return (
      <section id="tips" className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Tips</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-400">No tips sent yet. Send your first tip above!</p>
        </div>
      </section>
    )
  }

  return (
    <section id="tips">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recent Tips</h2>
        <span className="text-sm text-slate-400">
          {tips.length} tip{tips.length !== 1 ? 's' : ''} sent
        </span>
      </div>
      
      <div className="grid gap-4">
        {tips.map((tip) => (
          <TipCard
            key={tip.id}
            tip={tip}
          />
        ))}
      </div>
    </section>
  )
}