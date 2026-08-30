import { useEffect, useMemo, useState } from 'react'
import { api } from './api'

const emptyInvite = {
  role_title: '',
  role_summary: '',
  salary_min: '',
  salary_max: '',
  work_arrangement: 'hybrid',
  reason_for_interest: '',
  expires_in_days: 7,
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function App() {
  const [role, setRole] = useState('employer')
  const [employers, setEmployers] = useState([])
  const [employerId, setEmployerId] = useState('')
  const [candidates, setCandidates] = useState([])
  const [selected, setSelected] = useState(null)
  const [inviteForm, setInviteForm] = useState(emptyInvite)
  const [invitations, setInvitations] = useState([])
  const [candidateId, setCandidateId] = useState('')
  const [filters, setFilters] = useState({
    skill: '',
    location: '',
    role: '',
    work_arrangement: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const activeEmployer = useMemo(
    () => employers.find((item) => String(item.id) === String(employerId)),
    [employers, employerId],
  )

  const activeCandidate = useMemo(
    () => candidates.find((item) => String(item.id) === String(candidateId)),
    [candidates, candidateId],
  )

  useEffect(() => {
    async function boot() {
      try {
        const [employerData, candidateData] = await Promise.all([
          api.getEmployers(),
          api.getCandidates(),
        ])
        setEmployers(employerData)
        setCandidates(candidateData)
        if (employerData[0]) setEmployerId(String(employerData[0].id))
        if (candidateData[0]) setCandidateId(String(candidateData[0].id))
      } catch (err) {
        setError(err.message)
      }
    }
    boot()
  }, [])

  useEffect(() => {
    if (role !== 'candidate' || !candidateId) return
    loadInvitations(candidateId)
  }, [role, candidateId])

  async function searchCandidates(event) {
    event?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.getCandidates(filters)
      setCandidates(data)
      setMessage(`Found ${data.length} candidate${data.length === 1 ? '' : 's'}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadInvitations(id) {
    setLoading(true)
    setError('')
    try {
      const data = await api.getInvitations({ candidate: id })
      setInvitations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function sendInvitation(event) {
    event.preventDefault()
    if (!selected || !employerId) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await api.createInvitation({
        employer_id: Number(employerId),
        candidate_id: selected.id,
        role_title: inviteForm.role_title,
        role_summary: inviteForm.role_summary,
        salary_min: Number(inviteForm.salary_min),
        salary_max: Number(inviteForm.salary_max),
        work_arrangement: inviteForm.work_arrangement,
        reason_for_interest: inviteForm.reason_for_interest,
        expires_in_days: Number(inviteForm.expires_in_days),
      })
      setInviteForm(emptyInvite)
      setMessage(`Interview invitation sent to ${selected.full_name}.`)
      setSelected(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function respond(invitationId, action) {
    setLoading(true)
    setError('')
    try {
      await api.respondToInvitation(invitationId, action)
      setMessage(`Invitation ${action === 'save' ? 'saved for later' : action + 'ed'}.`)
      await loadInvitations(candidateId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1 className="brand">
            First<span>Pass</span>
          </h1>
        </div>
        <div className="role-switch" role="tablist" aria-label="Switch user role">
          <button
            type="button"
            className={role === 'employer' ? 'active' : ''}
            onClick={() => setRole('employer')}
          >
            Employer
          </button>
          <button
            type="button"
            className={role === 'candidate' ? 'active' : ''}
            onClick={() => setRole('candidate')}
          >
            Candidate
          </button>
        </div>
      </header>

      {message && <div className="banner">{message}</div>}
      {error && <div className="banner error">{error}</div>}

      {role === 'employer' ? (
        <div className="split">
          <section className="panel">
            <h2>Find matching candidates</h2>
            <p className="lede">
              Search by skill, location, preferred role, and work arrangement — then invite
              first.
            </p>

            <label>
              Acting as employer
              <select value={employerId} onChange={(e) => setEmployerId(e.target.value)}>
                {employers.map((employer) => (
                  <option key={employer.id} value={employer.id}>
                    {employer.name} — {employer.company}
                  </option>
                ))}
              </select>
            </label>

            <form className="filters" onSubmit={searchCandidates} style={{ marginTop: '1rem' }}>
              <label>
                Skill
                <input
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                  placeholder="React"
                />
              </label>
              <label>
                Location
                <input
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="Miami"
                />
              </label>
              <label>
                Preferred role
                <input
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  placeholder="Frontend"
                />
              </label>
              <label>
                Work arrangement
                <select
                  value={filters.work_arrangement}
                  onChange={(e) =>
                    setFilters({ ...filters, work_arrangement: e.target.value })
                  }
                >
                  <option value="">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </label>
              <div className="actions" style={{ alignSelf: 'end' }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Search
                </button>
              </div>
            </form>

            <div className="grid">
              {candidates.length === 0 && (
                <p className="empty">No candidates match these filters.</p>
              )}
              {candidates.map((candidate) => (
                <article
                  key={candidate.id}
                  className={`candidate-card ${selected?.id === candidate.id ? 'selected' : ''}`}
                >
                  <div>
                    <h3>{candidate.full_name}</h3>
                    <p className="meta">
                      {candidate.headline} · {candidate.location} ·{' '}
                      {candidate.experience_years} yrs
                    </p>
                  </div>
                  <p className="meta">{candidate.summary}</p>
                  <div className="skills">
                    {candidate.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <p className="meta">
                    Prefers {candidate.preferred_role} · {candidate.preferred_work_arrangement} ·{' '}
                    {formatMoney(candidate.preferred_salary_min)}+
                  </p>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setSelected(candidate)
                        setInviteForm({
                          ...emptyInvite,
                          role_title: candidate.preferred_role,
                          work_arrangement: candidate.preferred_work_arrangement,
                          salary_min: candidate.preferred_salary_min,
                          salary_max: candidate.preferred_salary_min + 15000,
                        })
                      }}
                    >
                      Invite to interview
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Send interview invitation</h2>
            <p className="lede">
              Transparent invitations require salary, work arrangement, role summary, and why
              you are interested.
            </p>

            {!selected ? (
              <p className="empty">Select a candidate to compose an invitation.</p>
            ) : (
              <form className="form-grid" onSubmit={sendInvitation}>
                <p className="meta">
                  To <strong>{selected.full_name}</strong> from{' '}
                  <strong>{activeEmployer?.company || 'your company'}</strong>
                </p>
                <label>
                  Role title
                  <input
                    required
                    value={inviteForm.role_title}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role_title: e.target.value })
                    }
                  />
                </label>
                <label>
                  Role summary
                  <textarea
                    required
                    value={inviteForm.role_summary}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, role_summary: e.target.value })
                    }
                  />
                </label>
                <div className="form-row">
                  <label>
                    Salary min
                    <input
                      required
                      type="number"
                      min="0"
                      value={inviteForm.salary_min}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, salary_min: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Salary max
                    <input
                      required
                      type="number"
                      min="0"
                      value={inviteForm.salary_max}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, salary_max: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Work arrangement
                    <select
                      value={inviteForm.work_arrangement}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          work_arrangement: e.target.value,
                        })
                      }
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </label>
                  <label>
                    Expires in (days)
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={inviteForm.expires_in_days}
                      onChange={(e) =>
                        setInviteForm({
                          ...inviteForm,
                          expires_in_days: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  Reason for interest
                  <textarea
                    required
                    value={inviteForm.reason_for_interest}
                    onChange={(e) =>
                      setInviteForm({
                        ...inviteForm,
                        reason_for_interest: e.target.value,
                      })
                    }
                    placeholder="Why does this candidate fit the opening?"
                  />
                </label>
                <div className="actions">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    Send invitation
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setSelected(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      ) : (
        <section className="panel">
          <h2>Candidate invitation inbox</h2>
          <p className="lede">
            Respond with Accept Interview, Save for Later, or Decline. Saved invitations still
            expire on schedule.
          </p>

          <label style={{ maxWidth: 360, marginBottom: '1rem' }}>
            Viewing as candidate
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            >
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.full_name}
                </option>
              ))}
            </select>
          </label>

          {activeCandidate && (
            <p className="meta" style={{ marginBottom: '1rem' }}>
              {activeCandidate.headline} · open to {activeCandidate.preferred_role} roles
            </p>
          )}

          <div className="grid">
            {invitations.length === 0 && (
              <p className="empty">No invitations yet. Switch to Employer and send one.</p>
            )}
            {invitations.map((invite) => (
              <article key={invite.id} className="invite-card">
                <div className="actions" style={{ justifyContent: 'space-between' }}>
                  <h3>{invite.role_title}</h3>
                  <span className={`status ${invite.status}`}>{invite.status}</span>
                </div>
                <p className="meta">
                  From {invite.employer.name} at {invite.employer.company} · Expires{' '}
                  {formatDate(invite.expires_at)}
                </p>
                <p>{invite.role_summary}</p>
                <p className="meta">
                  {formatMoney(invite.salary_min)} – {formatMoney(invite.salary_max)} ·{' '}
                  {invite.work_arrangement}
                </p>
                <p>
                  <strong>Why they reached out:</strong> {invite.reason_for_interest}
                </p>
                {(invite.status === 'pending' || invite.status === 'saved') && (
                  <div className="actions">
                    <button
                      type="button"
                      className="btn btn-accept"
                      disabled={loading}
                      onClick={() => respond(invite.id, 'accept')}
                    >
                      Accept Interview
                    </button>
                    <button
                      type="button"
                      className="btn btn-save"
                      disabled={loading}
                      onClick={() => respond(invite.id, 'save')}
                    >
                      Save for Later
                    </button>
                    <button
                      type="button"
                      className="btn btn-decline"
                      disabled={loading}
                      onClick={() => respond(invite.id, 'decline')}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
