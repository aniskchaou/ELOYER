const CLIENT_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/client';
const CORP_BASE   = (process.env.VUE_APP_API_BASE_URL || '/api') + '/corporate';

async function req(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error((payload && payload.error) || `Request failed (${res.status})`);
  return payload;
}

const c = (path, opts) => req(CLIENT_BASE, path, opts);
const o = (path, opts) => req(CORP_BASE, path, opts);

// Client Portal
export const cpGetDashboard      = (id)     => c(`/dashboard/${id}`);
export const cpGetCases          = (id)     => c(`/cases/${id}`);
export const cpGetTimeline       = (cid, csid) => c(`/cases/${cid}/${csid}/timeline`);
export const cpGetDocuments      = (id)     => c(`/documents/${id}`);
export const cpUploadDocument    = (id, b)  => c(`/documents/${id}/upload`, { method: 'POST', body: JSON.stringify(b) });
export const cpGetInvoices       = (id)     => c(`/invoices/${id}`);
export const cpPayInvoice        = (b)      => c('/payments', { method: 'POST', body: JSON.stringify(b) });
export const cpGetMeetings       = (id)     => c(`/meetings/${id}`);
export const cpBookMeeting       = (b)      => c('/meetings', { method: 'POST', body: JSON.stringify(b) });
export const cpGetFAQ            = (q)      => c(`/faq${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const cpFAQView           = (id)     => c(`/faq/${id}/view`, { method: 'POST' });
export const cpGetESignature     = (id)     => c(`/esignature/${id}`);
export const cpSignDocument      = (id)     => c(`/esignature/${id}/sign`, { method: 'PATCH' });

// Corporate Portal
export const coGetDashboard      = (id)     => o(`/dashboard/${id}`);
export const coGetRequests       = (id)     => o(`/requests/${id}`);
export const coCreateRequest     = (b)      => o('/requests', { method: 'POST', body: JSON.stringify(b) });
export const coUpdateRequest     = (id, b)  => o(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(b) });
export const coGetApprovals      = (id, s)  => o(`/approvals/${id}${s ? `?status=${s}` : ''}`);
export const coCreateApproval    = (b)      => o('/approvals', { method: 'POST', body: JSON.stringify(b) });
export const coDecideApproval    = (id, b)  => o(`/approvals/${id}/decide`, { method: 'PATCH', body: JSON.stringify(b) });
export const coGetContracts      = (id)     => o(`/contracts/${id}`);
export const coCreateContract    = (b)      => o('/contracts', { method: 'POST', body: JSON.stringify(b) });
export const coGetSpending       = (id)     => o(`/spending/${id}`);
