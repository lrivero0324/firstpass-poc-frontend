const DEFAULT_API_BASE = import.meta.env.PROD
  ? 'https://firstpass-poc-backend.vercel.app/api'
  : 'http://127.0.0.1:8000/api'

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || DEFAULT_API_BASE

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(
        `API returned non-JSON (${response.status}). Check that the frontend points at the Django API (${API_BASE}).`,
      )
    }
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      Object.values(data || {})[0]?.[0] ||
      `Request failed (${response.status})`
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }

  return data
}

export const api = {
  getCandidates: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null),
    ).toString()
    return request(`/candidates/${query ? `?${query}` : ''}`)
  },
  getEmployers: () => request('/employers/'),
  getInvitations: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== '' && value != null),
    ).toString()
    return request(`/invitations/${query ? `?${query}` : ''}`)
  },
  createInvitation: (payload) =>
    request('/invitations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  respondToInvitation: (id, action) =>
    request(`/invitations/${id}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
}
