const API_BASE = (process.env.VUE_APP_API_BASE_URL || '/api') + '/firmadmin';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const isJson = response.headers.get('content-type') && response.headers.get('content-type').includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) throw new Error((payload && payload.error) || `Request failed (${response.status})`);
  return payload;
}

// Firm Admin
export const faGetDashboard        = ()          => request('/dashboard');
export const faGetProfile          = ()          => request('/profile');
export const faUpdateProfile       = (body)      => request('/profile', { method: 'PATCH', body: JSON.stringify(body) });

export const faGetDepartments      = ()          => request('/departments');
export const faCreateDepartment    = (body)      => request('/departments', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateDepartment    = (id, body)  => request(`/departments/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const faDeleteDepartment    = (id)        => request(`/departments/${id}`, { method: 'DELETE' });

export const faGetLocations        = ()          => request('/locations');
export const faCreateLocation      = (body)      => request('/locations', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateLocation      = (id, body)  => request(`/locations/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const faDeleteLocation      = (id)        => request(`/locations/${id}`, { method: 'DELETE' });

export const faGetInvitations      = ()          => request('/invitations');
export const faCreateInvitation    = (body)      => request('/invitations', { method: 'POST', body: JSON.stringify(body) });
export const faResendInvitation    = (id)        => request(`/invitations/${id}/resend`, { method: 'PATCH' });
export const faDeleteInvitation    = (id)        => request(`/invitations/${id}`, { method: 'DELETE' });

export const faGetWorkflows        = ()          => request('/workflows');
export const faCreateWorkflow      = (body)      => request('/workflows', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateWorkflow      = (id, body)  => request(`/workflows/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const faDeleteWorkflow      = (id)        => request(`/workflows/${id}`, { method: 'DELETE' });

export const faGetPricing          = ()          => request('/pricing');
export const faCreatePricing       = (body)      => request('/pricing', { method: 'POST', body: JSON.stringify(body) });
export const faUpdatePricing       = (id, body)  => request(`/pricing/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
export const faDeletePricing       = (id)        => request(`/pricing/${id}`, { method: 'DELETE' });

export const faGetRevenue          = ()          => request('/revenue');

// Senior Lawyer / Approvals
export const faGetApprovals        = (status)    => request(`/approvals${status ? `?status=${status}` : ''}`);
export const faCreateApproval      = (body)      => request('/approvals', { method: 'POST', body: JSON.stringify(body) });
export const faDecideApproval      = (id, body)  => request(`/approvals/${id}/decide`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetStrategies       = (caseId)    => request(`/strategies${caseId ? `?case_id=${caseId}` : ''}`);
export const faCreateStrategy      = (body)      => request('/strategies', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateStrategy      = (id, body)  => request(`/strategies/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetSettlements      = ()          => request('/settlements');
export const faCreateSettlement    = (body)      => request('/settlements', { method: 'POST', body: JSON.stringify(body) });
export const faReviewSettlement    = (id, body)  => request(`/settlements/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetThreads          = (caseId)    => request(`/collaboration/threads${caseId ? `?case_id=${caseId}` : ''}`);
export const faCreateThread        = (body)      => request('/collaboration/threads', { method: 'POST', body: JSON.stringify(body) });
export const faGetMessages         = (threadId)  => request(`/collaboration/threads/${threadId}/messages`);
export const faSendMessage         = (threadId, body) => request(`/collaboration/threads/${threadId}/messages`, { method: 'POST', body: JSON.stringify(body) });

// Attorney Tools
export const faGetPleadings        = (caseId)    => request(`/pleadings${caseId ? `?case_id=${caseId}` : ''}`);
export const faCreatePleading      = (body)      => request('/pleadings', { method: 'POST', body: JSON.stringify(body) });
export const faUpdatePleading      = (id, body)  => request(`/pleadings/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetOCR              = (lawyerId)  => request(`/ocr${lawyerId ? `?lawyer_id=${lawyerId}` : ''}`);
export const faSubmitOCR           = (body)      => request('/ocr', { method: 'POST', body: JSON.stringify(body) });

export const faGetAIDrafts         = (lawyerId)  => request(`/ai-drafts${lawyerId ? `?lawyer_id=${lawyerId}` : ''}`);
export const faCreateAIDraft       = (body)      => request('/ai-drafts', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateAIDraft       = (id, body)  => request(`/ai-drafts/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetDeadlines        = (lawyerId)  => request(`/deadlines${lawyerId ? `?lawyer_id=${lawyerId}` : ''}`);
export const faCreateDeadline      = (body)      => request('/deadlines', { method: 'POST', body: JSON.stringify(body) });
export const faUpdateDeadline      = (id, body)  => request(`/deadlines/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const faGetBillableHours    = (lawyerId)  => request(`/billable-hours${lawyerId ? `?lawyer_id=${lawyerId}` : ''}`);
export const faCreateBillableHour  = (body)      => request('/billable-hours', { method: 'POST', body: JSON.stringify(body) });

export const faGetEmailIntegrations = (userId)   => request(`/email-integrations${userId ? `?user_id=${userId}` : ''}`);
export const faConnectEmail         = (body)      => request('/email-integrations', { method: 'POST', body: JSON.stringify(body) });
export const faToggleEmail          = (id)        => request(`/email-integrations/${id}/toggle`, { method: 'PATCH' });
