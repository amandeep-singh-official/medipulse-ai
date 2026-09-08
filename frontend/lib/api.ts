export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAuthHeader(): Promise<string> {
  const { createClient } = await import('./supabase')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return `Bearer ${session.access_token}`
}

async function handleResponse(res: Response, defaultMessage: string) {
  if (!res.ok) {
    let errorDetail = defaultMessage
    try {
      const data = await res.json()
      errorDetail = data.detail || data.message || defaultMessage
    } catch {
      try {
        const text = await res.text()
        if (text) errorDetail = text
      } catch {}
    }
    throw new Error(errorDetail)
  }
  return res.json()
}

export async function uploadReport(file: File, category: string, reportDate: string, labName: string) {
  const auth = await getAuthHeader()
  const form = new FormData()
  form.append('file', file)
  form.append('category', category)
  form.append('report_date', reportDate)
  form.append('lab_name', labName)

  const res = await fetch(`${API_URL}/api/reports/upload`, {
    method: 'POST',
    headers: { Authorization: auth },
    body: form,
  })
  return handleResponse(res, 'Upload failed')
}

export async function extractReport(reportId: string) {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/reports/${reportId}/extract`, {
    method: 'POST',
    headers: { Authorization: auth },
  })
  return handleResponse(res, 'Extraction failed')
}

export async function confirmReport(reportId: string, biomarkers: any[]) {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/reports/${reportId}/confirm`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ biomarkers }),
  })
  return handleResponse(res, 'Save failed')
}

export async function getDashboard() {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/reports/dashboard`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error('Failed to load dashboard')
  return res.json()
}

export async function getTrends(biomarkerName: string) {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/reports/trends/${encodeURIComponent(biomarkerName)}`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error('Failed to load trends')
  return res.json()
}

export async function getRecommendations() {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/reports/recommendations`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error('Failed to load recommendations')
  return res.json()
}

export async function deleteUserAccount(): Promise<{ status: string; message: string }> {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/users/delete-account`, {
    method: 'POST',
    headers: { Authorization: auth },
  })
  return handleResponse(res, 'Account deletion failed')
}

export async function getChatSuggestions(): Promise<{ suggestions: string[]; has_data: boolean }> {
  const auth = await getAuthHeader()
  const res = await fetch(`${API_URL}/api/chat/suggestions`, {
    headers: { Authorization: auth },
  })
  if (!res.ok) throw new Error('Failed to load chat suggestions')
  return res.json()
}
