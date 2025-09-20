import { getAttendanceSessions } from '@/lib/cosmic'
import SessionCard from '@/components/SessionCard'
import type { AttendanceSession } from '@/types'

export default async function AttendanceSessionsSection() {
  const sessions = await getAttendanceSessions() as AttendanceSession[]

  if (!sessions || sessions.length === 0) {
    return (
      <section id="sessions" className="card">
        <h2 className="text-2xl font-bold mb-4">Attendance Sessions</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-400">No attendance sessions yet. Create your first session above!</p>
        </div>
      </section>
    )
  }

  return (
    <section id="sessions">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Attendance Sessions</h2>
        <span className="text-sm text-slate-400">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} total
        </span>
      </div>
      
      <div className="grid gap-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
          />
        ))}
      </div>
    </section>
  )
}