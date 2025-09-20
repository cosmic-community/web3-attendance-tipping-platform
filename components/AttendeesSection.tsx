import { getAttendees } from '@/lib/cosmic'
import AttendeeCard from '@/components/AttendeeCard'
import type { Attendee } from '@/types'

export default async function AttendeesSection() {
  const attendees = await getAttendees() as Attendee[]

  if (!attendees || attendees.length === 0) {
    return (
      <section id="attendees" className="card">
        <h2 className="text-2xl font-bold mb-4">Active Attendees</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400">No attendees registered yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="attendees">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Active Attendees</h2>
        <span className="text-sm text-slate-400">
          {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} registered
        </span>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {attendees.map((attendee) => (
          <AttendeeCard
            key={attendee.id}
            attendee={attendee}
          />
        ))}
      </div>
    </section>
  )
}