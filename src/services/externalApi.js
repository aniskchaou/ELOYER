const EXT_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/external';

async function req(path, options = {}) {
  const res = await fetch(`${EXT_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error((payload && payload.error) || `Request failed (${res.status})`);
  return payload;
}

// Expert Consultant
export const extGetReports       = (p)       => req(`/expert-reports${p ? `?${new URLSearchParams(p)}` : ''}`);
export const extCreateReport     = (b)       => req('/expert-reports', { method: 'POST', body: JSON.stringify(b) });
export const extUpdateReport     = (id, b)   => req(`/expert-reports/${id}`, { method: 'PATCH', body: JSON.stringify(b) });

// Court Liaison
export const extGetNotices       = (caseId)  => req(`/court-notices${caseId ? `?case_id=${caseId}` : ''}`);
export const extCreateNotice     = (b)       => req('/court-notices', { method: 'POST', body: JSON.stringify(b) });
export const extUpdateNotice     = (id, b)   => req(`/court-notices/${id}`, { method: 'PATCH', body: JSON.stringify(b) });

export const extGetFilings       = (p)       => req(`/filings${p ? `?${new URLSearchParams(p)}` : ''}`);
export const extCreateFiling     = (b)       => req('/filings', { method: 'POST', body: JSON.stringify(b) });
export const extUpdateFiling     = (id, b)   => req(`/filings/${id}`, { method: 'PATCH', body: JSON.stringify(b) });

export const extGetCourtComms    = (caseId)  => req(`/court-comms${caseId ? `?case_id=${caseId}` : ''}`);
export const extCreateCourtComm  = (b)       => req('/court-comms', { method: 'POST', body: JSON.stringify(b) });

// Investigator
export const extGetFindings      = (p)       => req(`/findings${p ? `?${new URLSearchParams(p)}` : ''}`);
export const extCreateFinding    = (b)       => req('/findings', { method: 'POST', body: JSON.stringify(b) });

export const extGetInterviews    = (caseId)  => req(`/interviews${caseId ? `?case_id=${caseId}` : ''}`);
export const extCreateInterview  = (b)       => req('/interviews', { method: 'POST', body: JSON.stringify(b) });

export const extGetCustody       = (caseId)  => req(`/custody/${caseId}`);
export const extAddCustody       = (b)       => req('/custody', { method: 'POST', body: JSON.stringify(b) });

// Compliance Officer
export const extGetCompliance    = (userId)  => req(`/compliance${userId ? `?reviewer_id=${userId}` : ''}`);
export const extRunCompliance    = (b)       => req('/compliance', { method: 'POST', body: JSON.stringify(b) });
export const extApproveCompliance = (id)     => req(`/compliance/${id}/approve`, { method: 'PATCH' });
export const extRejectCompliance  = (id)     => req(`/compliance/${id}/reject`, { method: 'PATCH' });
export const extResolveFlag       = (id)     => req(`/compliance/flags/${id}/resolve`, { method: 'PATCH' });
