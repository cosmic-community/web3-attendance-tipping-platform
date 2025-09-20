import type { AttendeeCardProps } from '@/types'

export default function AttendeeCard({ attendee }: AttendeeCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-4 mb-4">
        {attendee.metadata.profile_picture?.imgix_url ? (
          <img
            src={`${attendee.metadata.profile_picture.imgix_url}?w=80&h=80&fit=crop&auto=format,compress`}
            alt={attendee.metadata.name}
            className="w-12 h-12 rounded-full object-cover"
            width="48"
            height="48"
          />
        ) : (
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {attendee.metadata.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold">{attendee.metadata.name}</h3>
          {attendee.metadata.email && (
            <p className="text-sm text-slate-400">{attendee.metadata.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <label className="label text-xs text-slate-400">Total Attendance</label>
          <div className="text-lg font-semibold text-green-400">
            {attendee.metadata.total_attendance || 0} sessions
          </div>
        </div>
        <div>
          <label className="label text-xs text-slate-400">Member Since</label>
          <div className="text-sm">
            {formatDate(attendee.metadata.join_date || '')}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="label text-xs text-slate-400">Wallet Address</label>
        <div className="eth-address text-xs bg-slate-800 rounded px-2 py-1 break-all">
          {attendee.metadata.wallet_address}
        </div>
      </div>

      {/* Sessions Attended */}
      {attendee.metadata.sessions_attended && attendee.metadata.sessions_attended.length > 0 && (
        <div>
          <label className="label text-xs text-slate-400 mb-2">Sessions Attended</label>
          <div className="space-y-2">
            {attendee.metadata.sessions_attended.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between text-xs bg-slate-800 rounded px-2 py-1">
                <span>{session.title}</span>
                <span className="text-slate-400">
                  {formatDate(session.metadata.session_date)}
                </span>
              </div>
            ))}
            {attendee.metadata.sessions_attended.length > 3 && (
              <div className="text-xs text-slate-400 text-center">
                +{attendee.metadata.sessions_attended.length - 3} more sessions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}